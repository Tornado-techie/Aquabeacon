const express = require('express');
const Article = require('../models/Article');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all articles (with access control)
router.get('/', optionalAuthenticate, async (req, res) => {
  try {
    const { category, subcategory, page = 1, limit = 10 } = req.query;
    
    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    const articles = await Article.find(filter)
      .select('title slug excerpt category subcategory accessLevel isPremium featuredImage readTime views publishedAt')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add access information for each article
    const articlesWithAccess = articles.map(article => {
      const articleObj = article.toObject();
      articleObj.hasAccess = article.canUserAccess(req.user);
      articleObj.requiresPremium = article.isPremium;
      return articleObj;
    });

    const total = await Article.countDocuments(filter);

    res.json({
      success: true,
      articles: articlesWithAccess,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching articles', 
      error: error.message 
    });
  }
});

// Get single article by slug
router.get('/:slug', optionalAuthenticate, async (req, res) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });

    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    // Check access
    const hasAccess = article.canUserAccess(req.user);
    
    let content;
    if (hasAccess) {
      content = article.content;
      // Increment view count
      article.views += 1;
      await article.save();
    } else {
      content = article.getPreview();
    }

    res.json({
      success: true,
      article: {
        ...article.toObject(),
        content,
        hasAccess,
        requiresPremium: article.isPremium,
        isPreview: !hasAccess && article.isPremium
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching article', 
      error: error.message 
    });
  }
});

// Get article preview (always available)
router.get('/:slug/preview', async (req, res) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });

    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    res.json({
      success: true,
      article: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.getPreview(),
        category: article.category,
        subcategory: article.subcategory,
        requiresPremium: article.isPremium,
        accessLevel: article.accessLevel,
        readTime: article.readTime,
        publishedAt: article.publishedAt,
        isPreview: true
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching preview', 
      error: error.message 
    });
  }
});

module.exports = router;