import type { FC } from 'hono/jsx';


const Index: FC<{ message: string }> = function ({ message }) {
  return (
    <main>
      <h1 class="text-3xl">Hello world</h1>
      <span>{message}</span>
      <div id="content"
        hx-get="/api/v1/list"
        hx-trigger="load"
        hx-swap="innerHTML">
        Loading...
      </div>
    </main>
  )
}


export default Index