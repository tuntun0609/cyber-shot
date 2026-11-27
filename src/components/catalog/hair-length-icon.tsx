import { useId } from "react";
import type { HairLengthPathTag } from "./hair-length-paths";
import { HAIR_LENGTH_PATHS } from "./hair-length-paths";

function mirrorX(x: number) {
  return 512 - x;
}

function createTipClipPair(top: number, bottom: number) {
  const outerTop = 74;
  const outerBottom = 76;
  const innerTop = 204;
  const innerBottom = 209;
  const controlTopOuter = 110;
  const controlTopInner = 158;
  const controlBottomOuter = 165;
  const controlBottomInner = 112;

  return {
    left: `M${outerTop} ${top}C${controlTopOuter} ${top + 13} ${controlTopInner} ${top + 17} ${innerTop} ${top + 7}L${innerBottom} ${bottom}C${controlBottomOuter} ${bottom + 15} ${controlBottomInner} ${bottom + 10} ${outerBottom} ${bottom - 9}Z`,
    right: `M${mirrorX(outerTop)} ${top}C${mirrorX(controlTopOuter)} ${top + 13} ${mirrorX(controlTopInner)} ${top + 17} ${mirrorX(innerTop)} ${top + 7}L${mirrorX(innerBottom)} ${bottom}C${mirrorX(controlBottomOuter)} ${bottom + 15} ${mirrorX(controlBottomInner)} ${bottom + 10} ${mirrorX(outerBottom)} ${bottom - 9}Z`,
  };
}

const TIP_CLIPS = {
  超短发: createTipClipPair(150, 302),
  短发: createTipClipPair(150, 320),
  齐耳: createTipClipPair(170, 335),
  下巴: createTipClipPair(180, 355),
  齐颈: createTipClipPair(190, 385),
  锁骨发: createTipClipPair(205, 405),
  齐肩: createTipClipPair(210, 445),
  中长发: createTipClipPair(215, 500),
  长发: createTipClipPair(220, 500),
} satisfies Record<HairLengthPathTag, ReturnType<typeof createTipClipPair>>;

function isHairLengthPathTag(tag: string): tag is HairLengthPathTag {
  return tag in HAIR_LENGTH_PATHS;
}

function DefaultLengthIcon({ height }: { height: number }) {
  return (
    <span aria-hidden="true" className="relative block h-7.5 w-7">
      <span className="absolute top-1 left-2.25 z-10 h-3 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <span
        className="absolute top-0 left-1.25 w-4.5 rounded-t-[9px] rounded-b-[3px] bg-zinc-600/85 dark:bg-zinc-300/85"
        style={{ height }}
      />
    </span>
  );
}

function VectorLengthIcon({ tag }: { tag: HairLengthPathTag }) {
  const id = useId().replaceAll(":", "");
  const shapeId = `${id}-shape`;
  const baseClipId = `${id}-base-clip`;
  const leftClipId = `${id}-left-clip`;
  const rightClipId = `${id}-right-clip`;
  const tipClip = TIP_CLIPS[tag];

  return (
    <svg
      aria-hidden="true"
      className="text-foreground/85 h-8 w-8"
      fill="none"
      viewBox="0 0 512 512"
    >
      <defs>
        <path
          d={HAIR_LENGTH_PATHS[tag]}
          id={shapeId}
          transform="translate(0 512) scale(0.1 -0.1)"
        />
        <clipPath id={baseClipId}>
          <path
            clipRule="evenodd"
            d={`M0 0H512V512H0Z ${tipClip.left} ${tipClip.right}`}
          />
        </clipPath>
        <clipPath id={leftClipId}>
          <path d={tipClip.left} />
        </clipPath>
        <clipPath id={rightClipId}>
          <path d={tipClip.right} />
        </clipPath>
      </defs>
      <use
        clipPath={`url(#${baseClipId})`}
        fill="currentColor"
        href={`#${shapeId}`}
        opacity=".82"
      />
      <g className="hair-length-sway-left">
        <use
          clipPath={`url(#${leftClipId})`}
          fill="currentColor"
          href={`#${shapeId}`}
          opacity=".82"
        />
      </g>
      <g className="hair-length-sway-right">
        <use
          clipPath={`url(#${rightClipId})`}
          fill="currentColor"
          href={`#${shapeId}`}
          opacity=".82"
        />
      </g>
    </svg>
  );
}

export function HairLengthIcon({
  height,
  tag,
}: {
  height: number;
  tag: string;
}) {
  if (isHairLengthPathTag(tag)) {
    return <VectorLengthIcon tag={tag} />;
  }
  return <DefaultLengthIcon height={height} />;
}
