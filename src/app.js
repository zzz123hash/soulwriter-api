const fastify = require('fastify')({ logger: true })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Health check
fastify.get('/health', async () => ({ status: 'ok' }))

// Projects CRUD
fastify.get('/api/v1/projects', async () => prisma.project.findMany())
fastify.post('/api/v1/projects', async (req) => prisma.project.create({ data: req.body }))

// Roles CRUD
fastify.get('/api/v1/roles/:projectId', async (req) => 
  prisma.role.findMany({ where: { projectId: req.params.projectId } }))

fastify.post('/api/v1/roles', async (req) => prisma.role.create({ data: req.body }))

// Soul matrix
fastify.get('/api/v1/roles/:id/soul', async (req) => {
  const role = await prisma.role.findUnique({ where: { id: req.params.id } })
  return { soul: role?.soulData || '{}' }
})

fastify.put('/api/v1/roles/:id/soul', async (req) => {
  return prisma.role.update({ where: { id: req.params.id }, data: { soulData: req.body.soul } })
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log('Server running at http://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
