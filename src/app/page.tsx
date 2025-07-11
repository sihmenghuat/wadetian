"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type Item = {
  id: number;
  name: string;
  description: string;
  mediaUrl?: string;
  mercid?: string;
};

export default function ItemsCarouselPage() {
  // SSR-safe: get mercid from window only in useEffect
  const [mercid, setMercid] = React.useState("");
  const [userSession, setUserSession] = React.useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });
  const [itemList, setItemList] = React.useState<Item[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: "up" | "down") => {
    if (!carouselRef.current) return;
    const carouselHeight = carouselRef.current.offsetHeight;
    carouselRef.current.scrollBy({
      top: direction === "up" ? -carouselHeight : carouselHeight,
      behavior: "smooth",
    });
  };

  // SSR-safe: get mercid from window.location in useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      setMercid(url.searchParams.get("mercid") || "");
    }
  }, []);

  // Fetch session and items
  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => setUserSession(data));
  }, []);

  useEffect(() => {
    // Only fetch items after session and mercid are set
    if (userSession.userId && userSession.userType === "merc") {
      fetch(`/api/items?mercid=${encodeURIComponent(userSession.userId)}`)
        .then(res => res.json())
        .then(data => setItemList(data));
    } else if (mercid) {
      fetch(`/api/items?mercid=${encodeURIComponent(mercid)}`)
        .then(res => res.json())
        .then(data => setItemList(data));
    } else {
      fetch("/api/items")
        .then(res => res.json())
        .then(data => setItemList(data));
    }
  }, [mercid, userSession.userId, userSession.userType]);

  // Helper for merchant image fallback
  const [imgErrorMap, setImgErrorMap] = React.useState<{ [key: string]: boolean }>({});
  const handleImgError = (mercid: string) => {
    setImgErrorMap(prev => ({ ...prev, [mercid]: true }));
  };

  return (
    <div className={styles.container}>
      {userSession.userId && (<div className="mb-2 text-xs text-gray-600">ID: {userSession.userType ?? "-"} {userSession.userId ?? "-"}</div>)}
      <button className="bg-green-300 text-white text-sm px-1 py-0.5 rounded hover:bg-green-700 transition" onClick={() => scrollByCard("up")}>▲</button>
      <div ref={carouselRef} className={styles.carousel}>
        {itemList.length === 0 && <p>No items found.</p>}
        {itemList.map((item, idx) => (
          <div
            key={item.id}
            className={`${styles.card} ${styles.cardPointer} ${styles.cardCursorPointer} flex relative`}
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
                priority={idx === 0} // LCP priority for first image
              />
            ) : (
              <div className={styles.noMedia}>No Media</div>
            )}
            {/* Buttons on far right for users */}
            {userSession.userId && userSession.userType === "user" && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center h-full gap-2">
                {/* Merchant image button, not nested in another button */}
                {item.mercid && (
                  <button
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm cursor-pointer p-0 overflow-hidden"
                    tabIndex={-1}
                    type="button"
                    aria-label="Merchant"
                    onClick={e => {
                      e.stopPropagation();
                      window.location.href = `/?mercid=${encodeURIComponent(String(item.mercid))}`;
                    }}
                  >
                    {imgErrorMap[item.mercid] ? (
                      <Image src="/galney.jpg" alt="merchant" width={60} height={60} className="rounded-full w-full h-full object-cover" />
                    ) : (
                      <Image src={`/${item.mercid}.jpg`} alt={`/${item.mercid}`} width={60} height={60} className="rounded-full w-full h-full object-cover" onError={() => handleImgError(item.mercid!)} />
                    )}
                  </button>
                )}
                {/* Coin buttons, not nested */}
                <button
                  className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm cursor-pointer p-0 overflow-hidden"
                  tabIndex={-1}
                  type="button"
                  aria-label="Coin"
                >
                  <Image src="/coin.jpeg" alt="coin" width={60} height={60} className="rounded-full w-full h-full object-cover" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm cursor-pointer p-0 overflow-hidden"
                  tabIndex={-1}
                  type="button"
                  aria-label="Coin"
                >
                  <Image src="/coin.jpeg" alt="coin" width={60} height={60} className="rounded-full w-full h-full object-cover" />
                </button>
              </div>
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
