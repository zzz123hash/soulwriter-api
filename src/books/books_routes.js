/**
 * SoulWriter Books API 路由
 * Action风格 - 所有操作通过 action 参数区分
 */

const BooksService = require('../services/books_service');

async function booksRoutes(fastify) {
  
  // ========== 书架 API ==========
  
  // 创建书架
  fastify.post('/api/bookshelves', async (request, reply) => {
    const result = BooksService.createBookshelf(request.body || {});
    return { success: true, data: result };
  });
  
  // 获取所有书架
  fastify.get('/api/bookshelves', async (request, reply) => {
    const shelves = BooksService.getAllBookshelves();
    return { success: true, data: shelves };
  });
  
  // ========== 书本 API ==========
  
  // 书本统一入口
  fastify.post('/api/books', async (request, reply) => {
    const { action, ...data } = request.body;
    
    switch (action) {
      case 'create':
        const newBook = BooksService.createBook(data);
        return { success: true, data: newBook };
        
      case 'list':
        const books = BooksService.getAllBooks();
        return { success: true, data: books };
        
      case 'get':
        const book = BooksService.getBook(data.id);
        return { success: true, data: book };
        
      case 'update':
        const updated = BooksService.updateBook(data.id, data);
        return { success: true, data: updated };
        
      case 'delete':
        BooksService.deleteBook(data.id);
        return { success: true, message: 'Book deleted' };
        
      case 'search':
        // TODO: 语义搜索
        return { success: true, data: [], message: 'Search pending' };
        
      default:
        // 默认创建
        const defaultBook = BooksService.createBook(request.body);
        return { success: true, data: defaultBook };
    }
  });
  
  // 获取单个书本
  fastify.get('/api/books/:id', async (request, reply) => {
    const book = BooksService.getBook(request.params.id);
    if (!book) {
      return reply.status(404).send({ success: false, message: 'Book not found' });
    }
    return { success: true, data: book };
  });
  
  // 删除书本
  fastify.delete('/api/books/:id', async (request, reply) => {
    BooksService.deleteBook(request.params.id);
    return { success: true, message: 'Book deleted' };
  });
  
  // ========== 章节 API ==========
  
  fastify.post('/api/chapters', async (request, reply) => {
    const { action, bookId, ...data } = request.body;
    
    switch (action) {
      case 'create':
        const chapter = BooksService.createChapter(bookId, data);
        return { success: true, data: chapter };
        
      case 'update':
        const updated = BooksService.updateChapter(bookId, data.id, data);
        return { success: true, data: updated };
        
      case 'delete':
        BooksService.deleteChapter(bookId, data.id);
        return { success: true, message: 'Chapter deleted' };
        
      default:
        return reply.status(400).send({ success: false, message: 'Unknown action' });
    }
  });
  
  // ========== 记忆宫殿 API ==========
  
  fastify.get('/api/palace/:bookId', async (request, reply) => {
    const palace = BooksService.getPalaceNodes(request.params.bookId);
    return { success: true, data: palace };
  });
  
  fastify.post('/api/palace', async (request, reply) => {
    const { bookId, ...data } = request.body;
    const node = BooksService.createPalaceNode(bookId, data);
    return { success: true, data: node };
  });
  
  // ========== 向量 API ==========
  
  fastify.post('/api/vector/generate', async (request, reply) => {
    const { text, field } = request.body;
    const vector = BooksService.generateVector(text, field);
    return { success: true, data: vector };
  });
}

module.exports = booksRoutes;
