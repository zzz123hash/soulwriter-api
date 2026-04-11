const BooksService = require('./services/books_service');

async function booksRoutes(fastify) {
  // Bookshelf APIs
  fastify.post('/api/bookshelves', async (req, reply) => {
    const result = BooksService.createBookshelf(req.body || {});
    return { success: true, data: result };
  });
  
  fastify.get('/api/bookshelves', async (req, reply) => {
    const shelves = BooksService.getAllBookshelves();
    return { success: true, data: shelves };
  });

  // Book APIs (Action style)
  fastify.post('/api/books', async (req, reply) => {
    const { action, ...data } = req.body;
    switch (action) {
      case 'create':
        return { success: true, data: BooksService.createBook(data) };
      case 'list':
        return { success: true, data: BooksService.getAllBooks() };
      case 'get':
        return { success: true, data: BooksService.getBook(data.id) };
      case 'update':
        return { success: true, data: BooksService.updateBook(data.id, data) };
      case 'delete':
        BooksService.deleteBook(data.id);
        return { success: true, message: 'Deleted' };
      default:
        return { success: true, data: BooksService.createBook(req.body) };
    }
  });

  fastify.get('/api/books/:id', async (req, reply) => {
    const book = BooksService.getBook(req.params.id);
    if (!book) return reply.status(404).send({ success: false, message: 'Not found' });
    return { success: true, data: book };
  });

  fastify.delete('/api/books/:id', async (req, reply) => {
    return { success: true, data: BooksService.deleteBook(req.params.id) };
  });

  // Chapter APIs
  fastify.post('/api/chapters', async (req, reply) => {
    const { action, bookId, ...data } = req.body;
    switch (action) {
      case 'create':
        return { success: true, data: BooksService.createChapter(bookId, data) };
      case 'update':
        return { success: true, data: BooksService.updateChapter(bookId, data.id, data) };
      case 'delete':
        return { success: true, data: BooksService.deleteChapter(bookId, data.id) };
    }
  });

  // Palace APIs
  fastify.get('/api/palace/:bookId', async (req, reply) => {
    return { success: true, data: BooksService.getPalaceNodes(req.params.bookId) };
  });

  fastify.post('/api/palace', async (req, reply) => {
    const { bookId, ...data } = req.body;
    return { success: true, data: BooksService.createPalaceNode(bookId, data) };
  });
}

module.exports = booksRoutes;
