import React, { forwardRef } from "react";
import styled from "@emotion/styled";

export type InputProps = {
  id?: string;
  type: string;
  width?: number | string;
  height: number;
  onChange: (e: any) => void;
  onFocus?: (e: any) => void;
  placeholder: string;
  value: string | number;
  defaultValue?: string | number;
  isDisabled?: boolean;
  color?: string;
  background?: string;
  borderColor?: string;
  borderRadius?: number;
  autoComplete?: boolean;
  inputMode?: "text" | "email" | "numeric" | "decimal" | "search" | "none";
  isPassword?: boolean;
  inputRef?: React.MutableRefObject<HTMLInputElement>;
  hideValue?: boolean;
};

export const TextInput = forwardRef<InputProps, any>(
  (
    {
      id,
      type,
      width = "100%",
      height = 40,
      placeholder,
      isDisabled = false,
      onChange,
      onFocus,
      color = "#000",
      borderColor = "#979797",
      background = "#fff",
      borderRadius = 4,
      value,
      autoComplete = true,
      inputMode,
      isPassword,
      hideValue,
    },
    ref
  ) => {
    return (
      <TextField
        autoComplete={autoComplete ? "on" : "new-password"}
        id={id}
        disabled={isDisabled}
        placeholder={placeholder}
        value={value}
        type={type}
        height={height}
        width={width}
        onFocus={onFocus}
        onChange={onChange}
        color={color}
        background={background}
        borderColor={borderColor}
        borderRadius={borderRadius}
        inputMode={inputMode}
        isPassword={isPassword}
        hideValue={hideValue}
        ref={ref as any}
      />
    );
  }
);

const backgroundColor = (isDisabled: boolean, background: string) => {
  if (isDisabled) return "#e0e0e0";
  if (background) return background;
};

const TextField = styled.input<{
  height: number;
  width: number | string;
  disabled: boolean;
  color: string;
  background: string;
  borderColor: string;
  borderRadius: number;
  isPassword: boolean;
  hideValue: boolean;
}>`
  width: ${({ width = "100%" }) => (width === "100%" ? width : width + "px")};
  padding: ${({ isPassword }) =>
    isPassword ? " 12px 40px 12px 8px" : "12px 8px"};
  height: ${({ height }) => height}px;
  background: ${({ disabled, background }) =>
    backgroundColor(disabled, background)};
  color: ${({ color = "#000", hideValue }) =>
    hideValue ? "transparent" : color};
  border: ${({ borderColor = "#979797" }) => `1px solid ${borderColor}`};
  border-radius: ${({ borderRadius }) => borderRadius}px;
  &:focus {
    border: 1px solid #535ca8;
    outline: none;
  }
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    box-shadow: 0 0 0px 1000px #eff0ff inset;s
  }
  -webkit-appearance: none;
  appearance: none;
  ::placeholder,
  ::-webkit-input-placeholder {
    color:  #979797;;
  }
  :-ms-input-placeholder {
     color:  #979797;;
  }
`;
