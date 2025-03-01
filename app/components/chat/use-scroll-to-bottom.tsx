"use client";

import { useEffect, useRef } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [React.RefObject<T>, React.RefObject<T>] {
  const containerRef = useRef<T>(null);
  const messagesEndRef = useRef<T>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current && messagesEndRef.current) {
        const behavior = 'smooth';
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    };

    // Create an observer to watch for changes in the messages container
    const observer = new MutationObserver(scrollToBottom);

    // Start observing the container for changes
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true
      });
    }

    // Initial scroll to bottom
    scrollToBottom();

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  return [containerRef, messagesEndRef];
}