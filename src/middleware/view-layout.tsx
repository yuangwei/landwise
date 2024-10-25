import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        {import.meta.env.PROD ? (
          <>
            <link href="/static/style.css" rel="stylesheet" />
            <script defer type="module" src="/static/client.js"></script>
          </>
        ) : (
          <>
            <link href="/src/view/style.css" rel="stylesheet" />
            <script defer type="module" src="/src/view/index.tsx"></script>
          </>
        )}
        <title>Clockify</title>
      </head>
      <body>{children}</body>
    </html>
  )
})
