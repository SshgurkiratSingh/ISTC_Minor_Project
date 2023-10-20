"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button, Input } from "@nextui-org/react";

export default function ClientPasscodeLock({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLocked, setIsLocked] = useState(true);
  const [inputPasscode, setInputPasscode] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const checkPasscode = () => {
    if (inputPasscode === "1010") {
      setIsLocked(false);
      localStorage.setItem("isUnlocked", "true");
    } else {
      alert("Incorrect Passcode. Try again.");
    }
  };

  useEffect(() => {
    const isUnlocked = localStorage.getItem("isUnlocked");
    if (isUnlocked === "true") {
      setIsLocked(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Enter") {
      checkPasscode();
    }
    if (e.key === "Backspace" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  if (isLocked) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#121212",
          color: "#ffffff",
        }}
      >
        <h3>Minor Project</h3>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Input
              ref={(ref) => (inputsRef.current[i] = ref)}
              color="primary"
              type="password"
              size="lg"
              width="60px"
              onKeyDown={(e) => handleKeyDown(e, i)}
              onChange={(e) => {
                const value = e.target.value;
                setInputPasscode((prev) => {
                  let newCode = prev.split("");
                  newCode[i] = value;
                  return newCode.join("");
                });
                if (e.target.value && i < 3 && inputsRef.current[i + 1]) {
                  inputsRef.current[i + 1]?.focus();
                }
              }}
            />
          ))}
        </div>
        <Button color="primary" size="lg" onClick={checkPasscode}>
          Unlock
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
