"use client";
import React from "react";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Input component using forwardRef to handle ref properly
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
  
    return (
      
        <input
          type={type}
          className={`
            flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 
            text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
            focus-visible:outline-none focus-visible:ring-[2px] 
            focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
            disabled:cursor-not-allowed disabled:opacity-50
            dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
            group-hover/input:shadow-none transition duration-400
          `}
          ref={ref}
          {...props}
        />

    );
  }
);

Input.displayName = "Input";

export { Input };