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

  // Book APIs
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

  // Role APIs
  fastify.post('/api/roles', async (req, reply) => {
    const { action, bookId, ...data } = req.body;
    switch (action) {
      case 'create':
        return { success: true, data: BooksService.createRole(bookId, data) };
      case 'list':
        return { success: true, data: BooksService.getRoles(bookId) };
      case 'update':
        return { success: true, data: BooksService.updateRole(bookId, data.id, data) };
      case 'delete':
        return { success: true, data: BooksService.deleteRole(bookId, data.id) };
      default:
        return { success: true, data: BooksService.createRole(bookId, req.body) };
    }
  });

  // Item APIs
  fastify.post('/api/items', async (req, reply) => {
    const { action, bookId, ...data } = req.body;
    switch (action) {
      case 'create':
        return { success: true, data: BooksService.createItem(bookId, data) };
      case 'list':
        return { success: true, data: BooksService.getItems(bookId) };
      case 'update':
        return { success: true, data: BooksService.updateItem(bookId, data.id, data) };
      case 'delete':
        return { success: true, data: BooksService.deleteItem(bookId, data.id) };
      default:
        return { success: true, data: BooksService.createItem(bookId, req.body) };
    }
  });

  // Location APIs
  fastify.post('/api/locations', async (req, reply) => {
    const { action, bookId, ...data } = req.body;
    switch (action) {
      case 'create':
        return { success: true, data: BooksService.createLocation(bookId, data) };
      case 'list':
        return { success: true, data: BooksService.getLocations(bookId) };
      case 'update':
        return { success: true, data: BooksService.updateLocation(bookId, data.id, data) };
      case 'delete':
        return { success: true, data: BooksService.deleteLocation(bookId, data.id) };
      default:
        return { success: true, data: BooksService.createLocation(bookId, req.body) };
    }
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
      default:
        return { success: true, data: BooksService.createChapter(bookId, req.body) };
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

  // ============ 状态 API - 万物皆可 API ============
  
  // 主题列表
  fastify.get('/api/state/themes', async (req, reply) => {
    return { 
      success: true, 
      data: {
        themes: [
          { id: 'dark', name: '暗色', icon: '🌙' },
          { id: 'soft', name: '柔和', icon: '🌤️' },
          { id: 'blue', name: '蓝色', icon: '💙' },
          { id: 'green', name: '绿色', icon: '🌿' }
        ]
      }
    };
  });

  // 语言列表
  fastify.get('/api/state/langs', async (req, reply) => {
    return { 
      success: true, 
      data: {
        langs: [
          { id: 'zh-CN', name: '中文', flag: '🇨🇳' },
          { id: 'en-US', name: 'English', flag: '🇺🇸' }
        ]
      }
    };
  });

  // Tab 列表
  fastify.get('/api/state/tabs', async (req, reply) => {
    return { 
      success: true, 
      data: {
        tabs: ['home', 'genesis', 'event', 'nvwa', 'novel'],
        labels: {
          'home': '首页',
          'genesis': '创世树',
          'event': '事件线',
          'nvwa': '女娲推演',
          'novel': '小说详写'
        }
      }
    };
  });

  // 实体类型列表
  fastify.get('/api/state/entities', async (req, reply) => {
    return { 
      success: true, 
      data: {
        entities: ['roles', 'items', 'locations', 'nodes', 'units', 'world', 'settings', 'prompts', 'map'],
        labels: {
          'roles': '角色',
          'items': '物品',
          'locations': '地点',
          'nodes': '节点',
          'units': '单元',
          'world': '世界观',
          'settings': '设定',
          'prompts': '提示词',
          'map': '地图'
        },
        icons: {
          'roles': '👤',
          'items': '🎁',
          'locations': '📍',
          'nodes': '📌',
          'units': '📑',
          'world': '🌍',
          'settings': '⚙️',
          'prompts': '💬',
          'map': '🗺️'
        }
      }
    };
  });

  // 系统信息
  fastify.get('/api/state/info', async (req, reply) => {
    return {
      success: true,
      data: {
        name: 'SoulWriter',
        version: '1.0.0',
        description: '灵魂创作者 - AI 驱动的小说创作平台',
        endpoints: {
          books: '/api/books',
          roles: '/api/roles',
          items: '/api/items',
          locations: '/api/locations',
          chapters: '/api/chapters',
          palace: '/api/palace',
          state: '/api/state/*'
        }
      }
    };
  });
}

module.exports = booksRoutes;
