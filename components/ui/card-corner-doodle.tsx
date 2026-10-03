"use client";

import React from "react";

export type DoodleIconType =
  | "spark"
  | "cap"
  | "book"
  | "chart"
  | "star"
  | "coin"
  | "group"
  | "bell"
  | "teacher"
  | "student";

interface CardCornerDoodleProps {
  type?: DoodleIconType;
  className?: string;
}

export function CardCornerDoodle({
  type = "spark",
  className = "",
}: CardCornerDoodleProps) {
  // Removed completely per user request as it was blocking content on cards.
  return null;
}
