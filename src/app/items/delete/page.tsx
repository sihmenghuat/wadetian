"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

type Item = {
  id: number;
  name: string;
  description: string;
  mediaUrl?: string;
  mercid?: string;
  url?: string;
  type: "Url" | "Menu" | "Event" | "QrCode";
  itemDescription: string;
  price: string;
  points: number;
  eventDetails: string;
  eventDateTime: string;
  eventLocation: string;
  qrhash?: string;
};

export default function ItemDeletePage() {
  const [userSession, setUserSession] = useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });

  const [itemData, setItemData] = useState<Item | null>(null);
  const [itemid, setItemid] = React.useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => setUserSession(data));
  }, []);

  useEffect(() => {
    if (userSession.userId && userSession.userType !== "merc") {
      console.log("Redirecting to profile info");
      permanentRedirect(`/profileInfo`);
    }
  }, [userSession]);

  // SSR-safe: get itemid from window.location in useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      setItemid(url.searchParams.get("itemid") || "");
    }
  }, []);

useEffect(() => {
    // Only fetch items after session and itemid are set
    if (userSession.userId && userSession.userType === "merc" && itemid) {
      fetch(`/api/items/getitem?itemid=${encodeURIComponent(itemid)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            setItemData(data[0]);
          }
        })
        .catch(err => {
          console.error('Error fetching item:', err);
          setMessage('Error loading item details.');
          setIsError(true);
        });
    } 
  }, [itemid, userSession.userId, userSession.userType]);
  
  if (userSession.userId === null && userSession.userType === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="text-lg text-gray-500">Checking session...</span>
      </div>
    );
  }

  // Function to get human-readable type display name
  function getTypeDisplayName(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Adverts': 'Adverts',
      'Url': 'Reroute',
      'Menu': 'Menu Item',
      'Event': 'Event',
      'QrCode': 'QR Code'
    };
    return typeMap[type] || type;
  }

  function handleDeleteClick() {
    setShowConfirmation(true);
  }

  function handleCancelDelete() {
    setShowConfirmation(false);
  }

  async function handleConfirmDelete() {
    if (!itemData) return;
    
    setIsLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/items/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemid: itemid,
          mercid: userSession.userId
        }),
      });
      
      const result = await res.json();
      setMessage(result.message || "");
      setIsError(!result.success);
      
      if (result.success) {
        // Redirect to home page after successful deletion
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      setMessage("Error deleting item. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  }

  if (!itemData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="text-lg text-gray-500">Loading item details...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center p-5 min-h-screen bg-white">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Delete Item</h2>
        
        {/* Item Details Card */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Item Details</h3>
          
          {/* Media Display */}
          <div className="mb-4 flex justify-center">
            {itemData.mediaUrl && itemData.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={itemData.mediaUrl}
                playsInline
                className="max-w-full max-h-48 rounded"
              />
            ) : itemData.mediaUrl ? (
              <Image
                src={itemData.mediaUrl}
                alt={itemData.name}
                width={260}
                height={180}
                className="max-w-full max-h-48 rounded object-cover"
                priority
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                No Media
              </div>
            )}
          </div>
          
          {/* Item Information */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name:</label>
              <p className="text-gray-800">{itemData.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Description:</label>
              <p className="text-gray-800">{itemData.description || 'No description'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Type:</label>
              <p className="text-gray-800">{getTypeDisplayName(itemData.type)}</p>
            </div>
            
            {itemData.type === "Url" && itemData.url && (
              <div>
                <label className="text-sm font-medium text-gray-600">URL:</label>
                <p className="text-gray-800 break-all">{itemData.url}</p>
              </div>
            )}
            
            {itemData.type === "Menu" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description:</label>
                  <p className="text-gray-800">{itemData.itemDescription}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Price:</label>
                  <p className="text-gray-800">${itemData.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Points:</label>
                  <p className="text-gray-800">{itemData.points}</p>
                </div>
              </>
            )}
            
            {itemData.type === "Event" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">Event Details:</label>
                  <p className="text-gray-800">{itemData.eventDetails}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date & Time:</label>
                  <p className="text-gray-800">{new Date(itemData.eventDateTime).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location:</label>
                  <p className="text-gray-800">{itemData.eventLocation}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <span className="text-red-600 font-semibold">⚠️ Warning</span>
          </div>
          <p className="text-red-700 text-sm">
            This action cannot be undone. The item and all associated data will be permanently deleted.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isLoading ? 'Deleting...' : 'Delete Item'}
          </button>
          
          <Link
            href={`/?itemId=${itemid}`}
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-center"
          >
            Cancel
          </Link>
        </div>
        
        {/* Messages */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <p className="font-semibold">{message}</p>
          </div>
        )}
        
        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{itemData.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={handleCancelDelete}
                  disabled={isLoading}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
