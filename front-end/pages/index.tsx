
import React from "react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center bg-black min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="h-[40rem] flex items-center justify-center">
          <TextHoverEffect text="Cleaners" />
        </div>     
        <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4 fc-white"
          href="/signup"
          rel="noopener noreferrer"
        >
         
          Sign up now →
        </a> 
      </main>
  
    </div>
    
  );
}
