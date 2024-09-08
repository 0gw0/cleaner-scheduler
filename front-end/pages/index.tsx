
import React from "react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center bg-black min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="h-[40rem] flex items-center justify-center">
          <TextHoverEffect text="Cleaners" />
        </div>     
        <div>
          <a href="/signup">
          <TextHoverEffect text="Log In"/>
          </a>
        
        </div>
      </main>
  
    </div>
    
  );
}
