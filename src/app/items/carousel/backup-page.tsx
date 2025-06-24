"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type Item = {
  id: number;
  name: string;
  description: string;
  mediaUrl?: string;
};

export default function ItemsCarouselPage() {
  const [itemList, setItemList] = React.useState<Item[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null); // <-- Add this line

  const scrollByCard = (direction: "up" | "down") => {
    if (!carouselRef.current) return;
    const carouselHeight = carouselRef.current.offsetHeight;
    carouselRef.current.scrollBy({
      top: direction === "up" ? -carouselHeight : carouselHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    fetch("/api/items")
      .then(res => res.json())
      .then(data => setItemList(data));
  }, []);

  return (
    <div className={styles.container}>
      {/*<h2>Items Carousel</h2>*/}
      {/* Add navigation buttons if you want */}
      <button onClick={() => scrollByCard("up")}>▲</button>
      <div ref={carouselRef} className={styles.carousel}>
        {itemList.length === 0 && <p>No items found.</p>}
        {itemList.map(item => (
          <div key={item.id} className={styles.card}>
            <div className={styles.overlayText}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            {item.mediaUrl && item.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={item.mediaUrl}
                controls
                playsInline
                className={styles.mediaVideo}
              />
            ) : item.mediaUrl ? (
              <Image src={item.mediaUrl} alt={item.name} width={260} height={180} className={styles.mediaImage} />
            ) : (
              <div className={styles.noMedia}>No Media</div>
            )}

          </div>
        ))}
      </div>
      <button onClick={() => scrollByCard("down")}>▼</button>
    </div>
  );
}
