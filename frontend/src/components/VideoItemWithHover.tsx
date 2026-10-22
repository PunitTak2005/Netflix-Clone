import { useEffect, useState, useRef } from "react";
import { Movie } from "src/types/Movie";
import { usePortal } from "src/providers/PortalProvider";
import { useGetConfigurationQuery } from "src/store/slices/configuration";
import VideoItemWithHoverPure from "./VideoItemWithHoverPure";
import { getImageUrl } from "src/utils/common";
interface VideoItemWithHoverProps {
  video: Movie;
}

export default function VideoItemWithHover({ video }: VideoItemWithHoverProps) {
  const setPortal = usePortal();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { data: configuration } = useGetConfigurationQuery(undefined);

  useEffect(() => {
    if (isHovered) {
      setPortal(elementRef.current, video);
    }
  }, [isHovered]);

  const imageSrc = getImageUrl(
    video.backdrop_path || video.poster_path,
    "w300",
    configuration?.images?.secure_base_url || configuration?.images?.base_url
  );

  return (
    <VideoItemWithHoverPure
      ref={elementRef}
      handleHover={setIsHovered}
      src={imageSrc}
    />
  );
}
