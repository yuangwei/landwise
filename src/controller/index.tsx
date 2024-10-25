import { Context } from "hono";
import IndexPage from "../view/pages";

export default function IndexController(c: Context) {
  return c.render(<IndexPage message="123" />)
}