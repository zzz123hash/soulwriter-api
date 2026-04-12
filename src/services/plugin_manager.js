/**
 * 插件管理器 - Plugin Manager
 * 
 * 管理系统插件，支持钩子注册和触发
 */

const fs = require('fs');
const path = require('path');

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = {};
    this.pluginDir = path.join(__dirname, '../plugins');
  }

  /**
   * 初始化插件系统
   */
  async init() {
    // 确保插件目录存在
    if (!fs.existsSync(this.pluginDir)) {
      fs.mkdirSync(this.pluginDir, { recursive: true });
    }

    // 加载内置插件
    await this.loadBuiltInPlugins();
    
    // 注册全局钩子
    this.registerGlobalHooks();
    
    console.log(`[PluginManager] 已加载 ${this.plugins.size} 个插件`);
  }

  /**
   * 加载内置插件
   */
  async loadBuiltInPlugins() {
    const builtInPlugins = [
      'nvwa-tension-monitor',
      'genesis-ai-assistant'
    ];

    for (const pluginId of builtInPlugins) {
      await this.loadPlugin(path.join(this.pluginDir, pluginId));
    }
  }

  /**
   * 加载单个插件
   */
  async loadPlugin(pluginPath) {
    try {
      // 读取 manifest
      const manifestPath = path.join(pluginPath, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        return null;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      
      // 读取入口文件
      const indexPath = path.join(pluginPath, manifest.main || 'index.js');
      let index = {};
      if (fs.existsSync(indexPath)) {
        index = require(indexPath);
      }

      const plugin = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        author: manifest.author,
        description: manifest.description,
        hooks: index.hooks || {},
        schemas: index.schemas || {},
        enabled: true,
        path: pluginPath
      };

      this.plugins.set(manifest.id, plugin);
      
      // 注册插件钩子
      this.registerPluginHooks(plugin);
      
      return plugin;
    } catch (e) {
      console.error(`[PluginManager] 加载插件失败: ${pluginPath}`, e);
      return null;
    }
  }

  /**
   * 注册插件钩子
   */
  registerPluginHooks(plugin) {
    for (const hookName of Object.keys(plugin.hooks)) {
      if (!this.hooks[hookName]) {
        this.hooks[hookName] = [];
      }
      this.hooks[hookName].push({
        pluginId: plugin.id,
        handler: plugin.hooks[hookName]
      });
    }
  }

  /**
   * 注册全局钩子（系统级）
   */
  registerGlobalHooks() {
    // 预留系统钩子位置
  }

  /**
   * 触发钩子
   */
  async triggerHook(hookName, context = {}) {
    const handlers = this.hooks[hookName] || [];
    
    for (const { pluginId, handler } of handlers) {
      try {
        const plugin = this.plugins.get(pluginId);
        if (!plugin || !plugin.enabled) continue;
        
        await handler(context);
      } catch (e) {
        console.error(`[PluginManager] Hook ${hookName} error in ${pluginId}:`, e);
      }
    }
    
    return context;
  }

  /**
   * 获取插件列表
   */
  listPlugins() {
    return Array.from(this.plugins.values()).map(p => ({
      id: p.id,
      name: p.name,
      version: p.version,
      author: p.author,
      description: p.description,
      enabled: p.enabled
    }));
  }

  /**
   * 启用插件
   */
  enable(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * 禁用插件
   */
  disable(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * 获取插件详情
   */
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }
}

module.exports = new PluginManager();
