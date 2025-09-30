#!/usr/bin/env node

/**
 * سكريبت النسخ الاحتياطي التلقائي - السلامة أولاً
 */

const fs = require('fs');
const path = require('path');

class BackupManager {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 تم إنشاء مجلد النسخ الاحتياطي: ${this.backupDir}`);
    }
  }

  createBackup(filePath, operation = 'unknown') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = path.basename(filePath);
      const backupName = `${fileName}.backup_${operation}_${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      // نسخ الملف
      fs.copyFileSync(filePath, backupPath);

      console.log(`✅ تم إنشاء نسخة احتياطية: ${backupName}`);

      return {
        success: true,
        backupPath,
        originalPath: filePath,
        timestamp,
        operation
      };
    } catch (error) {
      console.error(`❌ فشل في إنشاء النسخة الاحتياطية لـ ${filePath}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  restoreBackup(backupPath, targetPath) {
    try {
      fs.copyFileSync(backupPath, targetPath);
      console.log(`🔄 تم استعادة النسخة الاحتياطية: ${backupPath} → ${targetPath}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ فشل في استعادة النسخة الاحتياطية:`, error.message);
      return { success: false, error: error.message };
    }
  }

  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = files
        .filter(file => file.includes('.backup_'))
        .map(file => {
          const parts = file.split('.backup_');
          const originalName = parts[0];
          const metadata = parts[1].split('_');

          return {
            fileName: file,
            originalName,
            operation: metadata[0],
            timestamp: metadata.slice(1).join('_'),
            fullPath: path.join(this.backupDir, file)
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('\n📋 قائمة النسخ الاحتياطية:');
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.originalName} (${backup.operation}) - ${backup.timestamp}`);
      });

      return backups;
    } catch (error) {
      console.error('❌ خطأ في قراءة النسخ الاحتياطية:', error.message);
      return [];
    }
  }

  cleanupOldBackups(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let deletedCount = 0;
      files.forEach(file => {
        if (file.includes('.backup_')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      });

      if (deletedCount > 0) {
        console.log(`🗑️ تم حذف ${deletedCount} نسخة احتياطية قديمة (أقدم من ${daysToKeep} أيام)`);
      }

      return { success: true, deletedCount };
    } catch (error) {
      console.error('❌ خطأ في تنظيف النسخ الاحتياطية القديمة:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// دوال مساعدة للاستخدام السريع
const backupManager = new BackupManager();

function backupFile(filePath, operation = 'manual') {
  return backupManager.createBackup(filePath, operation);
}

function restoreFile(backupPath, targetPath) {
  return backupManager.restoreBackup(backupPath, targetPath);
}

function listBackups() {
  return backupManager.listBackups();
}

// تصدير للاستخدام في سكريبتات أخرى
module.exports = {
  BackupManager,
  backupFile,
  restoreFile,
  listBackups
};

// تشغيل مباشر من سطر الأوامر
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'backup':
      if (args[1]) {
        backupManager.createBackup(args[1], args[2] || 'cli');
      } else {
        console.log('الاستخدام: node backup-manager.js backup <file-path> [operation]');
      }
      break;

    case 'list':
      backupManager.listBackups();
      break;

    case 'cleanup':
      const days = parseInt(args[1]) || 7;
      backupManager.cleanupOldBackups(days);
      break;

    case 'restore':
      if (args[1] && args[2]) {
        backupManager.restoreBackup(args[1], args[2]);
      } else {
        console.log('الاستخدام: node backup-manager.js restore <backup-path> <target-path>');
      }
      break;

    default:
      console.log('أوامر متاحة:');
      console.log('  backup <file> [operation] - إنشاء نسخة احتياطية');
      console.log('  list - عرض النسخ الاحتياطية');
      console.log('  cleanup [days] - حذف النسخ القديمة');
      console.log('  restore <backup> <target> - استعادة نسخة احتياطية');
  }
}