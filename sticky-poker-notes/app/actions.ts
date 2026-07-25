'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- TAG ACTIONS ---

export async function getTags() {
  try {
    return await prisma.tag.findMany({ orderBy: { label: 'asc' } });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

export async function createTag(data: { label: string; color: string }) {
  try {
    const tag = await prisma.tag.create({
      data: {
        label: data.label.trim(),
        color: data.color,
      },
    });
    revalidatePath('/');
    return { success: true, tag };
  } catch (error) {
    console.error('Failed to create tag:', error);
    return { success: false, error: 'Tag label already exists.' };
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.tag.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return { success: false, error: 'Failed to delete tag.' };
  }
}

// --- PLAYER ACTIONS ---

export async function getPlayers() {
  try {
    return await prisma.player.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { tag: true }, // Include the relational tag data
    });
  } catch (error) {
    console.error('Failed to fetch players:', error);
    return [];
  }
}

export async function createPlayer(data: {
  name: string;
  stakes?: string;
  notes: string;
  tagId?: string | null;
}) {
  try {
    const player = await prisma.player.create({
      data: {
        name: data.name.trim(),
        stakes: data.stakes?.trim() || null,
        notes: data.notes.trim(),
        tagId: data.tagId || null,
      },
    });
    revalidatePath('/');
    return { success: true, player };
  } catch (error) {
    console.error('Failed to create player:', error);
    return {
      success: false,
      error: 'Player name already exists or invalid data.',
    };
  }
}

export async function updatePlayer(
  id: string,
  data: { name: string; stakes?: string; notes: string; tagId?: string | null },
) {
  try {
    const player = await prisma.player.update({
      where: { id },
      data: {
        name: data.name.trim(),
        stakes: data.stakes?.trim() || null,
        notes: data.notes.trim(),
        tagId: data.tagId || null,
      },
    });
    revalidatePath('/');
    return { success: true, player };
  } catch (error) {
    console.error('Failed to update player:', error);
    return { success: false, error: 'Failed to update player.' };
  }
}

export async function deletePlayer(id: string) {
  try {
    await prisma.player.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete player:', error);
    return { success: false, error: 'Failed to delete player.' };
  }
}
