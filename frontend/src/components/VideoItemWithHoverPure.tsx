import { PureComponent, ForwardedRef, forwardRef } from "react";

type VideoItemWithHoverPureType = {
  src: string;
  innerRef: ForwardedRef<HTMLDivElement>;
  handleHover: (value: boolean) => void;
};

class VideoItemWithHoverPure extends PureComponent<VideoItemWithHoverPureType> {
  render() {
    return (
      <div
        ref={this.props.innerRef}
        style={{
          zIndex: 9,
          cursor: "pointer",
          borderRadius: "4px",
          width: "100%",
          position: "relative",
          paddingTop: "calc(9 / 16 * 100%)",
          backgroundColor: "#202020",
          overflow: "hidden",
        }}
      >
        <img
          src={this.props.src}
          alt=""
          loading="lazy"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            borderRadius: "4px",
            transition: "opacity 0.2s ease",
          }}
          onPointerEnter={() => {
            this.props.handleHover(true);
          }}
          onPointerLeave={() => {
            this.props.handleHover(false);
          }}
        />
      </div>
    );
  }
}

const VideoItemWithHoverRef = forwardRef<
  HTMLDivElement,
  Omit<VideoItemWithHoverPureType, "innerRef">
>((props, ref) => <VideoItemWithHoverPure {...props} innerRef={ref} />);
VideoItemWithHoverRef.displayName = "VideoItemWithHoverRef";

export default VideoItemWithHoverRef;
