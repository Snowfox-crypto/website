import { EvoCardPng } from "@/components/evo-card/evo-card";
import { Gender, Nature, Rarity, Species, Type } from "@/components/evo-card/types";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { tokenId: string }}) => {
  const tokenId = params.tokenId.replace(/[^0-9]/g,  '');
  const resp = await fetch(`https://api.evoverses.com/metadata/evo/${tokenId}`, {
    next: {
      tags: ['evo', tokenId],
      revalidate: 3_600,
    }
  })
  const metadata = await resp.json();
  const egg = !!metadata.attributes.find((a: any) => a.value === "Egg");
  let evo;
  if (!egg) {
    const sizeValue = metadata.attributes.find((a: any) => a.trait_type === "Size")?.value || 0
    const sizePct = sizeValue / 10;
    evo = {
      attributes: {
        gender: Gender[metadata.attributes.find((a: any) => a.trait_type === "Gender").value],
        rarity: Rarity[metadata.attributes.find((a: any) => a.trait_type === "Rarity").value],
        primaryType: Type[metadata.attributes.find((a: any) => a.trait_type === "Primary Type").value],
        secondaryType: Type[metadata.attributes.find((a: any) => a.trait_type === "Secondary Type")?.value || "None"],
        nature: Nature[metadata.attributes.find((a: any) => a.trait_type === "Nature").value],
        size: sizePct > 0 ? 10 + sizePct : sizePct,
      },
      breeds: {
        total: metadata.attributes.find((a: any) => a.trait_type === "Total Breeds")?.value,
        remaining: metadata.attributes.find((a: any) => a.trait_type === "Breeds Remaining")?.value,
        lastBreedTime: metadata.attributes.find((a: any) => a.trait_type === "Last Breed Time")?.value || 0,
      },
      experience: metadata.attributes.find((a: any) => a.trait_type === "XP").value,
      generation: metadata.attributes.find((a: any) => a.trait_type === "Generation").value,
      moves: { move0: 0, move1: 0, move2: 0, move3: 0 },
      owner: "",
      species: Species[metadata.attributes.find((a: any) => a.trait_type === "Species").value],
      stats: {
        health: 50,
        attack: metadata.attributes.find((a: any) => a.trait_type === "Attack").value,
        defense: metadata.attributes.find((a: any) => a.trait_type === "Defense").value,
        special: metadata.attributes.find((a: any) => a.trait_type === "Special").value,
        resistance: metadata.attributes.find((a: any) => a.trait_type === "Resistance").value,
        speed: metadata.attributes.find((a: any) => a.trait_type === "Speed").value,
      },
      tokenId: Number(tokenId)
    }
  } else {
    evo = {
      tokenId: Number(tokenId),
      species: Species[metadata.attributes.find((a: any) => a.trait_type === "Species").value],
      generation: metadata.attributes.find((a: any) => a.trait_type === "Generation").value,
      owner: "",
      parents: [0, 0],
      treated: !!metadata.attributes.find((a: any) => a.value === "Treated"),
      createdAt: metadata.attributes.find((a: any) => a.trait_type === "Created")?.value,
    }
    if (evo.generation > 0) {
      evo.parents = [
        Number(metadata.attributes.find((a: any) => a.trait_type === "Parent 1").value.replace("#", '')),
        Number(metadata.attributes.find((a: any) => a.trait_type === "Parent 2").value.replace("#", ''))
      ]
    }
  }

  const sizeMultiplier = 2;
  const baseUrl = req.url.split('/api')[0];
  const nunito = await fetch(
    new URL(`/fonts/Nunito.ttf`, baseUrl)
  ).then((res) => res.arrayBuffer());
  const nunitoBold = await fetch(
    new URL(`/fonts/Nunito-Bold.ttf`, baseUrl)
  ).then((res) => res.arrayBuffer());
  const nunitoSemiBold = await fetch(
    new URL(`/fonts/Nunito-SemiBold.ttf`, baseUrl)
  ).then((res) => res.arrayBuffer());
  return new ImageResponse(
    (<EvoCardPng evo={evo as any} multiplier={sizeMultiplier} baseUrl={baseUrl} />),
    {
      width: 236 * sizeMultiplier,
      height: 342 * sizeMultiplier,
      fonts: [
        {
          name: 'Nunito',
          data: nunito,
          weight: 400,
          style: 'normal'
        },
        {
          name: 'Nunito',
          data: nunitoSemiBold,
          weight: 500,
          style: 'normal'
        },
        {
          name: 'Nunito',
          data: nunitoBold,
          weight: 900,
          style: 'normal'
        }
      ]
    }
  );
};
