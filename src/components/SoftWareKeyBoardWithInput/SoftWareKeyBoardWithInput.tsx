import { useEffect, useRef, useState } from "react";
import { InputProps, TextInput } from "./TextInput";
import React from "react";
import styled from "@emotion/styled";
const keyboardValues = [
  "C",
  "backSpace",
  "7",
  "8",
  "9",
  "4",
  "5",
  "6",
  "1",
  "2",
  "3",
  "-",
  "0",
  ".",
];
const OPTIONAL_CLICK_ACTION = {
  deleteByCut: "deleteByCut",
  insertFromPaste: "insertFromPaste",
};

const DEFAULT_KEYBOARD_POSITION = { bottom: "14px", left: "14px" };
const LOCAL_STORAGE_KEY = "keyboardPosition";

type Props = InputProps & {
  disableKeyBoardValue?: string[];
};

const SoftWareKeyBoardWithInput: React.FC<Props> = (input) => {
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [value, setValue] = useState(input.value);
  const [selection, setSelection] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);

  const inputRef = useRef<any>(null);
  const inSideRef = useRef<any>(null);

  const randomId = Math.random().toString(32).substring(2);

  const handleInputChange = (v: any) => {
    //右クリックからコピペをした場合
    if (v?.nativeEvent?.inputType === OPTIONAL_CLICK_ACTION.deleteByCut) {
      setValue("");
      return input.onChange({ target: { value: "" } });
    } else if (
      v?.nativeEvent?.inputType === OPTIONAL_CLICK_ACTION.insertFromPaste
    ) {
      return;
    }

    const inputKeyboardValues = keyboardValues.filter((keyboardValue) => {
      // 入力可能な値のみを抽出
      const invalidValues = ["backSpace", "C"];
      return !invalidValues.includes(keyboardValue);
    });
    const pattern = new RegExp("^(" + inputKeyboardValues.join("|") + ")*$");

    if (pattern.test(v)) {
      // 入力可能文字だけの場合
      setValue(v);
      const e = { target: { value: v } };
      input.onChange(e);
    }
  };

  const handlerKeyboardClick = (keyboardValue: string) => {
    const input = inputRef.current;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;
    let fullValue = value.toString();
    let beforeValue = fullValue.slice(0, selectionStart);
    let afterValue = fullValue.slice(selectionStart);
    let middleValue = "";
    let newSelection = 0;

    if (selectionStart !== selectionEnd) {
      // 選択範囲があるときは文字を削除
      fullValue = beforeValue + afterValue;
    }

    switch (keyboardValue) {
      case "backSpace": // １文字削除
        beforeValue = beforeValue.slice(0, -1);
        newSelection = beforeValue.length;
        break;
      case "C": // クリア
        beforeValue = "";
        afterValue = "";
        break;
      default:
        middleValue = keyboardValue;
        newSelection = selectionStart + 1;
    }

    setSelection(newSelection);
    const newValue = beforeValue + middleValue + afterValue;
    handleInputChange(newValue);
  };

  useEffect(() => {
    if (initialized) {
      const input = inputRef.current;
      input?.focus();
      input?.setSelectionRange(selection, selection);
    }
    setInitialized(true);
  }, [selection]);

  const getKeyBoardPosition = () => {
    const position = localStorage.getItem(LOCAL_STORAGE_KEY);
    //表示初期値を指定
    if (!position) {
      return DEFAULT_KEYBOARD_POSITION;
    }
    const convertedPosition = JSON.parse(position);

    if (
      // キーボードが画面外から消えたときに、初期位置に戻る
      Number(convertedPosition.bottom.slice(0, -2)) < -222 || //画面下
      Number(convertedPosition.left.slice(0, -2)) < -280 || //画面左
      Number(convertedPosition.bottom.slice(0, -2)) > //画面上
        document.body.clientHeight - 40 ||
      Number(convertedPosition.left.slice(0, -2)) > //画面右
        document.body.clientWidth - 20
    ) {
      return DEFAULT_KEYBOARD_POSITION;
    }

    return JSON.parse(position);
  };

  const keyboardPosition = getKeyBoardPosition();
  //タッチ時にキーボードを動かす処理
  useEffect(() => {
    if (showKeyboard) {
      const keyBoard = document.getElementById(randomId);

      const onMouseMove = function (event: any) {
        event.preventDefault();
        const x = event.targetTouches[0].clientX;
        const y = event.targetTouches[0].clientY;
        const width = keyBoard?.offsetWidth ?? 0;
        const height = keyBoard?.offsetHeight ?? 0;
        //要修正
        if (!keyBoard) return;
        const keyboardBottom =
          document.body.clientHeight - (y + height / 2) + "px";
        const keyboardLeft = x - width / 2 + "px";
        keyBoard.style!.bottom = keyboardBottom;
        keyBoard.style!.left = keyboardLeft;
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            bottom: keyboardBottom,
            left: keyboardLeft,
          })
        );
      };
      keyBoard?.addEventListener("touchmove", onMouseMove, false);
      return () => {
        keyBoard?.removeEventListener("touchmove", onMouseMove, false);
      };
    }
  }, [showKeyboard]);

  //キーボード外もしくは、TextField外をタップした場合の処理
  useEffect(() => {
    //対象の要素を取得
    const el = inSideRef.current;
    //対象の要素がなければ何もしない
    if (!el) return;
    //クリックした時に実行する関数
    const handleClickOutside = (e: MouseEvent) => {
      if (!el?.contains(e.target as Node)) {
        setShowKeyboard(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [inSideRef]);

  return (
    <Box ref={inSideRef}>
      <>
        <TextInput
          {...input}
          type="text"
          inputMode="none"
          value={value}
          ref={inputRef}
          height={40}
          onChange={(e: any) => {
            handleInputChange(e);
          }}
          onFocus={() => setShowKeyboard(true)}
        />

        {showKeyboard && (
          <Card
            className="keyBoard"
            id={randomId}
            bottom={keyboardPosition.bottom}
            left={keyboardPosition.left}
          >
            <Grid>
              {keyboardValues.map((keyboardValue, i) => {
                const disabled =
                  input.disableKeyBoardValue &&
                  input?.disableKeyBoardValue.indexOf(keyboardValue) !== -1;
                //TODO キーに応じてstyle変更が多くなったら修正
                const fontSize = keyboardValue === "-" ? "32px" : "18px";
                const convetedkeyboardValue =
                  keyboardValue === "backSpace" ? <p>--</p> : keyboardValue;
                return (
                  <GridItem
                    key={i}
                    onClick={(e) =>
                      disabled || handlerKeyboardClick(keyboardValue)
                    }
                  >
                    <Box disabled={disabled}>{convetedkeyboardValue}</Box>
                  </GridItem>
                );
              })}
            </Grid>
          </Card>
        )}
      </>
    </Box>
  );
};

export default SoftWareKeyBoardWithInput;

const Box = styled.div<{ disabled?: boolean }>`
  background: ${({ disabled }) => (disabled ? "#d2d2d2" : "#fff")};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  border-radius: 4px;
  fontsize: 32px;
  box-shadow: 0px 2px 2px 0px rgb(0 0 0 / 9%), 0px 2px 2px 0px rgb(0 0 0 / 8%),
    0px 1px 8px 0px rgb(0 0 0 / 5%);
`;
const Card = styled.div<{ bottom: string; left: string }>`
  bottom: ${({ bottom }) => bottom};
  left: ${({ left }) => left};
  position: fixed;
  width: 360px;
  height: 280px;
  z-index: 10;
  background: #efefef;
`;
const Grid = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  margin-top: -8px;
  width: calc(100% + 8px);
  margin-left: -8px;
  padding: 8px;
`;
const GridItem = styled.div`
  flex-basis: 33.3333%;
  -webkit-box-flex: 0;
  flex-grow: 0;
  max-width: 33.3333%;
  padding-top: 8px;
`;
