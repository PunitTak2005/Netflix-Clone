import withPagination from "src/hoc/withPagination";
import { MEDIA_TYPE } from "src/types/Common";
import { CustomGenre, Genre } from "src/types/Genre";
import SlickSlider from "./slick-slider/SlickSlider";

interface SliderRowForGenreProps {
  genre: Genre | CustomGenre;
  mediaType: MEDIA_TYPE;
  isTop10Row?: boolean;
}

export default function SliderRowForGenre({
  genre,
  mediaType,
  isTop10Row,
}: SliderRowForGenreProps) {
  const Component = withPagination(SlickSlider, mediaType, genre);
  return <Component isTop10Row={isTop10Row} />;
}
