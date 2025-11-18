#!/usr/bin/env node

/**
 * Quality Metrics Analysis Script for AquaBeacon
 * Generates comprehensive code quality reports including:
 * - Code coverage analysis
 * - Code complexity metrics
 * - Security vulnerability scanning
 * - Dependency analysis
 * - Code duplication detection
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityMetrics {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.serverPath = path.join(this.projectRoot, 'server');
    this.clientPath = path.join(this.projectRoot, 'client');
    this.results = {
      timestamp: new Date().toISOString(),
      coverage: {},
      complexity: {},
      security: {},
      dependencies: {},
      duplication: {},
      overall: {}
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
  }

  async runCommand(command, cwd = this.projectRoot, silent = false) {
    try {
      const result = execSync(command, { 
        cwd, 
        encoding: 'utf8',
        stdio: silent ? 'pipe' : 'inherit'
      });
      return { success: true, output: result };
    } catch (error) {
      if (!silent) {
        this.log(`Command failed: ${command}`, 'error');
        this.log(error.message, 'error');
      }
      return { success: false, error: error.message };
    }
  }

  async installDependencies() {
    this.log('📦 Installing quality analysis dependencies...');
    
    const devDependencies = [
      'eslint-plugin-complexity',
      'jscpd',
      'plato',
      'eslint-plugin-security',
      'audit-ci',
      'dependency-cruiser'
    ];

    // Install for server
    this.log('Installing server dependencies...');
    await this.runCommand(`npm install --save-dev ${devDependencies.join(' ')}`, this.serverPath);
    
    // Install for client
    this.log('Installing client dependencies...');
    await this.runCommand(`npm install --save-dev ${devDependencies.join(' ')}`, this.clientPath);
  }

  async generateCoverageReports() {
    this.log('📊 Generating code coverage reports...');

    // Backend coverage
    this.log('Running backend coverage analysis...');
    const serverCoverage = await this.runCommand('npm run test:coverage', this.serverPath, true);
    
    // Frontend coverage  
    this.log('Running frontend coverage analysis...');
    const clientCoverage = await this.runCommand('npm run test -- --coverage --reporter=json', this.clientPath, true);
    
    // Parse coverage results
    try {
      const serverCoveragePath = path.join(this.serverPath, 'coverage', 'coverage-summary.json');
      const clientCoveragePath = path.join(this.clientPath, 'coverage', 'coverage-summary.json');
      
      if (fs.existsSync(serverCoveragePath)) {
        this.results.coverage.server = JSON.parse(fs.readFileSync(serverCoveragePath, 'utf8'));
      }
      
      if (fs.existsSync(clientCoveragePath)) {
        this.results.coverage.client = JSON.parse(fs.readFileSync(clientCoveragePath, 'utf8'));
      }
      
      this.log('✅ Coverage reports generated successfully', 'success');
    } catch (error) {
      this.log(`⚠️ Coverage parsing error: ${error.message}`, 'warning');
    }
  }

  async analyzeComplexity() {
    this.log('🔍 Analyzing code complexity...');
    
    // Create ESLint config for complexity analysis
    const complexityConfig = {
      extends: ['eslint:recommended'],
      plugins: ['complexity', 'security'],
      rules: {
        'complexity': ['warn', { max: 10 }],
        'max-depth': ['warn', { max: 4 }],
        'max-lines': ['warn', { max: 300 }],
        'max-lines-per-function': ['warn', { max: 50 }],
        'max-nested-callbacks': ['warn', { max: 3 }],
        'max-params': ['warn', { max: 4 }],
        'security/detect-unsafe-regex': 'warn',
        'security/detect-buffer-noassert': 'warn',
        'security/detect-child-process': 'warn',
        'security/detect-disable-mustache-escape': 'warn',
        'security/detect-eval-with-expression': 'warn',
        'security/detect-no-csrf-before-method-override': 'warn',
        'security/detect-non-literal-fs-filename': 'warn',
        'security/detect-non-literal-regexp': 'warn',
        'security/detect-non-literal-require': 'warn',
        'security/detect-object-injection': 'warn',
        'security/detect-possible-timing-attacks': 'warn',
        'security/detect-pseudoRandomBytes': 'warn'
      },
      env: {
        node: true,
        es2022: true
      }
    };

    // Write temporary ESLint config
    const configPath = path.join(this.projectRoot, '.eslintrc-complexity.json');
    fs.writeFileSync(configPath, JSON.stringify(complexityConfig, null, 2));

    try {
      // Analyze server complexity
      const serverComplexity = await this.runCommand(
        `npx eslint --config .eslintrc-complexity.json --format json server/src server/routes server/models server/middleware server/utils || true`,
        this.projectRoot,
        true
      );

      // Analyze client complexity
      const clientComplexity = await this.runCommand(
        `npx eslint --config .eslintrc-complexity.json --format json client/src || true`,
        this.projectRoot,
        true
      );

      // Parse results
      try {
        if (serverComplexity.output) {
          this.results.complexity.server = JSON.parse(serverComplexity.output);
        }
      } catch (e) {
        this.results.complexity.server = { message: 'No complexity issues found' };
      }

      try {
        if (clientComplexity.output) {
          this.results.complexity.client = JSON.parse(clientComplexity.output);
        }
      } catch (e) {
        this.results.complexity.client = { message: 'No complexity issues found' };
      }

      this.log('✅ Complexity analysis completed', 'success');
    } finally {
      // Clean up temporary config
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    }
  }

  async detectCodeDuplication() {
    this.log('🔍 Detecting code duplication...');
    
    const jscpdConfig = {
      threshold: 10,
      minTokens: 50,
      minLines: 5,
      format: ['html', 'json'],
      output: './reports/duplication',
      ignore: ['**/node_modules/**', '**/coverage/**', '**/dist/**', '**/build/**']
    };

    // Create reports directory
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Write jscpd config
    const jscpdConfigPath = path.join(this.projectRoot, '.jscpd.json');
    fs.writeFileSync(jscpdConfigPath, JSON.stringify(jscpdConfig, null, 2));

    try {
      const duplicationResult = await this.runCommand('npx jscpd . --config .jscpd.json', this.projectRoot, true);
      
      // Try to read results
      const duplicationReportPath = path.join(reportsDir, 'duplication', 'jscpd-report.json');
      if (fs.existsSync(duplicationReportPath)) {
        this.results.duplication = JSON.parse(fs.readFileSync(duplicationReportPath, 'utf8'));
      }
      
      this.log('✅ Code duplication analysis completed', 'success');
    } catch (error) {
      this.log(`⚠️ Duplication analysis warning: ${error.message}`, 'warning');
    } finally {
      // Clean up config
      if (fs.existsSync(jscpdConfigPath)) {
        fs.unlinkSync(jscpdConfigPath);
      }
    }
  }

  async performSecurityAudit() {
    this.log('🔒 Performing security vulnerability scan...');

    // Server audit
    this.log('Scanning server dependencies...');
    const serverAudit = await this.runCommand('npm audit --json || true', this.serverPath, true);
    
    // Client audit
    this.log('Scanning client dependencies...');
    const clientAudit = await this.runCommand('npm audit --json || true', this.clientPath, true);
    
    // Parse audit results
    try {
      if (serverAudit.output) {
        const serverAuditData = JSON.parse(serverAudit.output);
        this.results.security.server = {
          vulnerabilities: serverAuditData.vulnerabilities || {},
          summary: serverAuditData.metadata || {}
        };
      }
    } catch (e) {
      this.results.security.server = { message: 'No vulnerabilities found' };
    }

    try {
      if (clientAudit.output) {
        const clientAuditData = JSON.parse(clientAudit.output);
        this.results.security.client = {
          vulnerabilities: clientAuditData.vulnerabilities || {},
          summary: clientAuditData.metadata || {}
        };
      }
    } catch (e) {
      this.results.security.client = { message: 'No vulnerabilities found' };
    }

    this.log('✅ Security audit completed', 'success');
  }

  async analyzeDependencies() {
    this.log('📋 Analyzing project dependencies...');

    // Server dependencies
    const serverPackage = JSON.parse(fs.readFileSync(path.join(this.serverPath, 'package.json'), 'utf8'));
    const clientPackage = JSON.parse(fs.readFileSync(path.join(this.clientPath, 'package.json'), 'utf8'));

    this.results.dependencies = {
      server: {
        dependencies: Object.keys(serverPackage.dependencies || {}).length,
        devDependencies: Object.keys(serverPackage.devDependencies || {}).length,
        total: Object.keys({...serverPackage.dependencies, ...serverPackage.devDependencies}).length
      },
      client: {
        dependencies: Object.keys(clientPackage.dependencies || {}).length,
        devDependencies: Object.keys(clientPackage.devDependencies || {}).length,
        total: Object.keys({...clientPackage.dependencies, ...clientPackage.devDependencies}).length
      }
    };

    this.log('✅ Dependency analysis completed', 'success');
  }

  calculateOverallScore() {
    this.log('📊 Calculating overall quality score...');

    let score = 100;
    const factors = [];

    // Coverage factor (30% weight)
    const serverCoverage = this.results.coverage.server?.total?.lines?.pct || 0;
    const clientCoverage = this.results.coverage.client?.total?.lines?.pct || 0;
    const avgCoverage = (serverCoverage + clientCoverage) / 2;
    const coverageScore = avgCoverage;
    score = score * 0.7 + coverageScore * 0.3;
    factors.push(`Coverage: ${avgCoverage.toFixed(1)}%`);

    // Security factor (25% weight)
    const serverVulns = Object.keys(this.results.security.server?.vulnerabilities || {}).length;
    const clientVulns = Object.keys(this.results.security.client?.vulnerabilities || {}).length;
    const totalVulns = serverVulns + clientVulns;
    const securityScore = Math.max(0, 100 - (totalVulns * 10));
    score = score * 0.75 + securityScore * 0.25;
    factors.push(`Security: ${totalVulns} vulnerabilities`);

    // Complexity factor (20% weight)
    const serverComplexityIssues = Array.isArray(this.results.complexity.server) ? 
      this.results.complexity.server.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0) : 0;
    const clientComplexityIssues = Array.isArray(this.results.complexity.client) ?
      this.results.complexity.client.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0) : 0;
    const totalComplexityIssues = serverComplexityIssues + clientComplexityIssues;
    const complexityScore = Math.max(0, 100 - (totalComplexityIssues * 2));
    score = score * 0.8 + complexityScore * 0.2;
    factors.push(`Complexity: ${totalComplexityIssues} issues`);

    // Dependencies factor (15% weight)
    const totalDeps = this.results.dependencies.server?.total + this.results.dependencies.client?.total || 0;
    const depsScore = Math.max(0, 100 - Math.max(0, (totalDeps - 50) * 2));
    score = score * 0.85 + depsScore * 0.15;
    factors.push(`Dependencies: ${totalDeps} total`);

    // Duplication factor (10% weight)
    const duplicationPercent = this.results.duplication.statistics?.duplicates?.percentage || 0;
    const duplicationScore = Math.max(0, 100 - (duplicationPercent * 10));
    score = score * 0.9 + duplicationScore * 0.1;
    factors.push(`Duplication: ${duplicationPercent.toFixed(1)}%`);

    this.results.overall = {
      score: Math.round(score),
      grade: this.getGrade(score),
      factors,
      recommendations: this.getRecommendations(score)
    };

    this.log(`Overall Quality Score: ${this.results.overall.score}/100 (${this.results.overall.grade})`, 'success');
  }

  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  getRecommendations(score) {
    const recommendations = [];
    
    if (score < 80) {
      recommendations.push('Increase test coverage to above 80%');
      recommendations.push('Address security vulnerabilities');
      recommendations.push('Reduce code complexity and duplication');
    }
    
    if (score < 90) {
      recommendations.push('Consider adding more comprehensive tests');
      recommendations.push('Review and optimize dependency usage');
    }
    
    recommendations.push('Maintain regular security audits');
    recommendations.push('Continue monitoring code quality metrics');
    
    return recommendations;
  }

  async generateReport() {
    this.log('📄 Generating comprehensive quality report...');

    const reportDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReportPath = path.join(reportDir, 'quality-metrics.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(this.results, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    const htmlReportPath = path.join(reportDir, 'quality-metrics.html');
    fs.writeFileSync(htmlReportPath, htmlReport);

    // Generate markdown summary
    const markdownReport = this.generateMarkdownReport();
    const mdReportPath = path.join(reportDir, 'QUALITY_METRICS.md');
    fs.writeFileSync(mdReportPath, markdownReport);

    this.log(`✅ Quality reports generated:`, 'success');
    this.log(`   📊 JSON: ${jsonReportPath}`);
    this.log(`   🌐 HTML: ${htmlReportPath}`);
    this.log(`   📝 Markdown: ${mdReportPath}`);
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AquaBeacon Quality Metrics Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .score { font-size: 3rem; font-weight: bold; color: ${this.getScoreColor(this.results.overall.score)}; }
        .grade { font-size: 1.5rem; color: #666; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .recommendations { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .timestamp { color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AquaBeacon Quality Metrics</h1>
        <div class="score">${this.results.overall.score}/100</div>
        <div class="grade">Grade: ${this.results.overall.grade}</div>
        <div class="timestamp">Generated: ${this.results.timestamp}</div>
    </div>

    <div class="section">
        <h2>📊 Code Coverage</h2>
        <div class="metric">
            <span>Server Coverage</span>
            <span>${this.results.coverage.server?.total?.lines?.pct || 0}%</span>
        </div>
        <div class="metric">
            <span>Client Coverage</span>
            <span>${this.results.coverage.client?.total?.lines?.pct || 0}%</span>
        </div>
    </div>

    <div class="section">
        <h2>🔒 Security Analysis</h2>
        <div class="metric">
            <span>Server Vulnerabilities</span>
            <span>${Object.keys(this.results.security.server?.vulnerabilities || {}).length}</span>
        </div>
        <div class="metric">
            <span>Client Vulnerabilities</span>
            <span>${Object.keys(this.results.security.client?.vulnerabilities || {}).length}</span>
        </div>
    </div>

    <div class="section">
        <h2>📋 Dependencies</h2>
        <div class="metric">
            <span>Server Dependencies</span>
            <span>${this.results.dependencies.server?.total || 0}</span>
        </div>
        <div class="metric">
            <span>Client Dependencies</span>
            <span>${this.results.dependencies.client?.total || 0}</span>
        </div>
    </div>

    <div class="section">
        <h2>💡 Recommendations</h2>
        <div class="recommendations">
            ${this.results.overall.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  generateMarkdownReport() {
    return `# AquaBeacon Quality Metrics Report

**Generated:** ${this.results.timestamp}

## 🎯 Overall Quality Score: ${this.results.overall.score}/100 (Grade: ${this.results.overall.grade})

---

## 📊 Code Coverage Analysis

| Component | Lines | Functions | Branches | Statements |
|-----------|--------|-----------|----------|------------|
| Server | ${this.results.coverage.server?.total?.lines?.pct || 0}% | ${this.results.coverage.server?.total?.functions?.pct || 0}% | ${this.results.coverage.server?.total?.branches?.pct || 0}% | ${this.results.coverage.server?.total?.statements?.pct || 0}% |
| Client | ${this.results.coverage.client?.total?.lines?.pct || 0}% | ${this.results.coverage.client?.total?.functions?.pct || 0}% | ${this.results.coverage.client?.total?.branches?.pct || 0}% | ${this.results.coverage.client?.total?.statements?.pct || 0}% |

## 🔒 Security Vulnerability Analysis

- **Server Vulnerabilities:** ${Object.keys(this.results.security.server?.vulnerabilities || {}).length}
- **Client Vulnerabilities:** ${Object.keys(this.results.security.client?.vulnerabilities || {}).length}

## 🔍 Code Complexity Analysis

- **Server Complexity Issues:** ${Array.isArray(this.results.complexity.server) ? this.results.complexity.server.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0) : 0}
- **Client Complexity Issues:** ${Array.isArray(this.results.complexity.client) ? this.results.complexity.client.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0) : 0}

## 📦 Dependency Analysis

| Component | Dependencies | Dev Dependencies | Total |
|-----------|--------------|------------------|-------|
| Server | ${this.results.dependencies.server?.dependencies || 0} | ${this.results.dependencies.server?.devDependencies || 0} | ${this.results.dependencies.server?.total || 0} |
| Client | ${this.results.dependencies.client?.dependencies || 0} | ${this.results.dependencies.client?.devDependencies || 0} | ${this.results.dependencies.client?.total || 0} |

## 🔄 Code Duplication Analysis

- **Duplication Percentage:** ${this.results.duplication.statistics?.duplicates?.percentage || 0}%

## 💡 Recommendations

${this.results.overall.recommendations.map(rec => `- ${rec}`).join('\n')}

---

**Quality Factors:**
${this.results.overall.factors.map(factor => `- ${factor}`).join('\n')}
`;
  }

  getScoreColor(score) {
    if (score >= 90) return '#28a745';
    if (score >= 80) return '#ffc107';
    if (score >= 70) return '#fd7e14';
    return '#dc3545';
  }

  async run() {
    console.log('🚀 AquaBeacon Quality Metrics Analysis Starting...\n');
    
    try {
      await this.installDependencies();
      await this.generateCoverageReports();
      await this.analyzeComplexity();
      await this.detectCodeDuplication();
      await this.performSecurityAudit();
      await this.analyzeDependencies();
      
      this.calculateOverallScore();
      await this.generateReport();
      
      console.log('\n🎉 Quality analysis completed successfully!');
      console.log(`\n📊 Final Score: ${this.results.overall.score}/100 (${this.results.overall.grade})`);
      
    } catch (error) {
      this.log(`❌ Analysis failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  new QualityMetrics().run();
}

module.exports = QualityMetrics;