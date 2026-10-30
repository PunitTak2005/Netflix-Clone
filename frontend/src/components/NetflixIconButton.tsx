import { forwardRef } from "react";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";

const NetflixIconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, sx, ...others }, ref) => {
    return (
      <IconButton
        sx={{
          color: "#ffffff",
          bgcolor: "rgba(42, 42, 42, 0.6)",
          border: "1.5px solid rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(4px)",
          p: 1,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: "#ffffff",
            bgcolor: "rgba(255, 255, 255, 0.15)",
            transform: "scale(1.08)",
          },
          ...sx,
        }}
        {...others}
        ref={ref}
      >
        {children}
      </IconButton>
    );
  }
);

export default NetflixIconButton;
