/* eslint-disable unicorn/switch-case-braces */

export function digest(raw: string): number {
  let bitMap = 0;
  for (const char of raw) {
    bitMap |= characterBit(char);
  }
  return bitMap;
}

function characterBit(character: string): number {
  switch (character) {
    case " ":
      // Spaces are skipped!
      return 0;

    case "a":
    case "A":
      return 0x1;

    case "b":
    case "B":
      return 0x2;

    case "c":
    case "C":
      return 0x4;

    case "d":
    case "D":
      return 0x8;

    case "e":
    case "E":
      return 0x10;

    case "f":
    case "F":
      return 0x20;

    case "g":
    case "G":
      return 0x40;

    case "h":
    case "H":
      return 0x80;

    case "i":
    case "I":
      return 0x1_00;

    case "j":
    case "J":
      return 0x2_00;

    case "k":
    case "K":
      return 0x4_00;

    case "l":
    case "L":
      return 0x8_00;

    case "m":
    case "M":
      return 0x10_00;

    case "n":
    case "N":
      return 0x20_00;

    case "o":
    case "O":
      return 0x40_00;

    case "p":
    case "P":
      return 0x80_00;

    case "q":
    case "Q":
      return 0x1_00_00;

    case "r":
    case "R":
      return 0x2_00_00;

    case "s":
    case "S":
      return 0x4_00_00;

    case "t":
    case "T":
      return 0x8_00_00;

    case "u":
    case "U":
      return 0x10_00_00;

    case "v":
    case "V":
      return 0x20_00_00;

    case "w":
    case "W":
      return 0x40_00_00;

    case "x":
    case "X":
      return 0x80_00_00;

    case "y":
    case "Y":
      return 0x1_00_00_00;

    case "z":
    case "Z":
      return 0x2_00_00_00;

    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      // Encode all digits as the single bit 26
      return 0x4_00_00_00;

    default:
      // Encode all remaining 7-bit ascii characters as a single bit 27, and any
      // unicode/emoji character as the single bit 28
      return character < "\u007F" ? 0x8_00_00_00 : 0x10_00_00_00;
  }
}
