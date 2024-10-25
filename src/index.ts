import { Hono } from 'hono'
import viewLayout from './middleware/view-layout'
import IndexController from './controller'

const app = new Hono()

app.use(viewLayout)

app.get('/', IndexController)

app.get('/api/v1/list', (c) => {
  return c.text("OK")
})

export default app
