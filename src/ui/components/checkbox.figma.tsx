import figma from "@figma/code-connect";
import { Checkbox } from "./checkbox";

const FIGMA_URL =
  "https://www.figma.com/design/qwlkjiD0z3mImAJZGNPvmZ/Paperless-Courts?node-id=1222-151878";

figma.connect(Checkbox, FIGMA_URL, {
  props: {
    checked: figma.enum("State", {
      Checked: true,
      Unchecked: false,
      Partial: "indeterminate",
    }),
  },
  example: ({ checked }) => <Checkbox checked={checked} />,
});
