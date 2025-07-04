"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";
//import { LogoutForm } from "@/app/components/contact-logout";

type Item = {
  id: number;
  name: string;
  description: string;
  mediaUrl?: string;
};

export default function ItemsCarouselPage() {
  const [itemList, setItemList] = React.useState<Item[]>([]);
  const [userSession, setUserSession] = React.useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });
  const carouselRef = useRef<HTMLDivElement>(null);

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
    fetch("/api/session")
      .then(res => res.json())
      .then(data => setUserSession(data));
  }, []);

  return (
    <div className={styles.container}>
      {userSession.userId && (<div className="mb-2 text-xs text-gray-600">ID: {userSession.userType ?? "-"} {userSession.userId ?? "-"}</div>)}
      <button className="bg-green-300 text-white text-sm px-1 py-0.5 rounded hover:bg-green-700 transition" onClick={() => scrollByCard("up")}>▲</button>
      <div ref={carouselRef} className={styles.carousel}>
        {itemList.length === 0 && <p>No items found.</p>}
        {itemList.map(item => (
          <div
            key={item.id}
            className={`${styles.card} ${styles.cardPointer} ${styles.cardCursorPointer}`}
            onClick={e => {
              const video = (e.currentTarget as HTMLDivElement).querySelector("video");
              if (video) {
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }
            }}
          >
            <div className={styles.overlayText}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            {item.mediaUrl && item.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={item.mediaUrl}
                /*controls*/
                playsInline
                className={styles.mediaVideo}
              />
            ) : item.mediaUrl ? (
              <Image
                src={item.mediaUrl}
                alt={item.name}
                width={260}
                height={180}
                className={styles.mediaImage}
              />
            ) : (
              <div className={styles.noMedia}>No Media</div>
            )}
          </div>
        ))}
      </div>
      <button className="bg-green-300 text-white text-sm px-1 py-0.5 rounded hover:bg-green-700 transition" onClick={() => scrollByCard("down")}>▼</button>
      {userSession.userId && userSession.userType === "user" && (
        <div className={styles.loginWrapper}>
          <button
            className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => {
              window.location.href = "/qrcodeScan";
            }}
          >
            Scan QR
          </button>
          <button
            className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => {
              window.location.href = "/profileInfo";
            }}
          >
            Profile
          </button>
          {/*<LogoutForm userid={userSession.userId ?? ""} />*/}
        </div>
      )}
      {userSession.userId && userSession.userType === "merc" && (
        <div className={styles.loginWrapper}>
          <button
            className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => {
              window.location.href = "/qrcode";
            }}
          >
            Generate QR →
          </button>
          <button
            className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => {
              window.location.href = "/profileInfo";
            }}
          >
            Profile
          </button>
          {/*<LogoutForm userid={userSession.userId ?? ""} />*/}
        </div>
      )}      
      {!userSession.userId && (
        <div className={styles.loginWrapper}>
          <button
            className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Login
          </button>
          <button
            className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => {
              window.location.href = "/profileCreate";
            }}
          >
            Create Account
          </button>
        </div>
      )}
    </div>
  );
}
