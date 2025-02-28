"use server";

import { db } from "~/server/db/index";
import { cards } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "~/server/auth";

export type Card = {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
  isActive: boolean;
  createdAt: Date;
};

export async function getUserCard(): Promise<Card | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const userCards = await db
    .select({
      id: cards.id,
      cardNumber: cards.cardNumber,
      cardholderName: cards.cardholderName,
      cvv: cards.cvv,
      expiryDate: cards.expiryDate,
      cardType: cards.cardType,
      isActive: cards.isActive,
      createdAt: cards.createdAt,
    })
    .from(cards)
    .where(eq(cards.userId, userId))
    .limit(1);

  if (userCards.length === 0 || !userCards[0]) return null;
  const card = userCards[0];

  return {
    id: card.id,
    cardNumber: card.cardNumber,
    cardholderName: card.cardholderName,
    expiryDate: card.expiryDate,
    cardType: card.cardType,
    isActive: card.isActive,
    createdAt: new Date(card.createdAt!),
    cvv: card.cvv,
  };
}

export async function addCard(
  cardNumber: string,
  cardholderName: string,
  expiryDate: string,
  cvv: string,
): Promise<Card | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  // Check if user already has a card
  const existingCard = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, userId))
    .limit(1);

  if (existingCard.length > 0) {
    throw new Error("You already have a card registered");
  }

  // Determine card type based on first digit
  const firstDigit = cardNumber.charAt(0);
  let cardType = "Unknown";

  if (firstDigit === "4") {
    cardType = "Visa";
  } else if (firstDigit === "5") {
    cardType = "MasterCard";
  } else if (firstDigit === "3") {
    cardType = "American Express";
  } else if (firstDigit === "6") {
    cardType = "Discover";
  }

  const [newCard] = await db
    .insert(cards)
    .values({
      userId,
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      cardType,
    })
    .returning();

  if (!newCard) return null;

  return {
    id: newCard.id,
    cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
    cardholderName: newCard.cardholderName,
    expiryDate: newCard.expiryDate,
    cardType: newCard.cardType,
    isActive: newCard.isActive,
    createdAt: new Date(newCard.createdAt!),
    cvv: newCard.cvv,
  };
}

export async function removeCard(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const userId = session.user.id;

  try {
    await db.delete(cards).where(eq(cards.userId, userId));

    return true;
  } catch (error) {
    console.error("Failed to remove card:", error);
    return false;
  }
}
