#!/usr/bin/env node

/**
 * Vercel 환경변수 자동 설정 스크립트
 * 사용법: node scripts/setup-vercel-env.js
 * 
 * 이 스크립트는 모든 Vercel 환경(Production, Preview, Development)에
 * Supabase 환경변수를 자동으로 설정합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 환경변수 값들
const ENV_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://nktjoldoylvwtkzboyaf.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDUyODUsImV4cCI6MjA3MDcyMTI4NX0.ZGX25pgubs4PD8H8zY5wUi5cEKL500fiLjp1TY5PPyo',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NTI4NSwiZXhwIjoyMDcwNzIxMjg1fQ.RKNTdZq2OIZX2Gq3fVIUP-hrj3IKvIne52i-gHUgC_g'
};

const ENVIRONMENTS = ['production', 'preview', 'development'];

console.log('🚀 Vercel 환경변수 설정 시작...\n');

// Vercel CLI 설치 확인
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI 확인됨');
} catch (error) {
  console.error('❌ Vercel CLI가 설치되지 않았습니다.');
  console.log('📦 설치 명령: npm i -g vercel');
  process.exit(1);
}

// 프로젝트 루트 디렉토리 확인
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요.');
  process.exit(1);
}

console.log('✅ 프로젝트 루트 확인됨\n');

// 비동기 함수로 환경변수 설정
async function setupEnvironments() {
  for (const env of ENVIRONMENTS) {
    console.log(`🔧 ${env} 환경 설정 중...`);
    
    for (const [key, value] of Object.entries(ENV_VARS)) {
      try {
        // 기존 환경변수 제거 (무시해도 됨)
        try {
          execSync(`vercel env rm ${key} ${env} --yes`, { stdio: 'pipe' });
          console.log(`  🗑️ 기존 ${key} 제거됨`);
        } catch (e) {
          // 환경변수가 없으면 무시
        }
        
        // 새 환경변수 추가 - 더 안정적인 방법 사용
        await promiseifySpawn('vercel', ['env', 'add', key, env], value);
        console.log(`  ✅ ${key} 설정 완료`);
        
      } catch (error) {
        console.log(`  ⚠️ ${key} 설정 중 오류: ${error.message}`);
        
        // 대안 방법 시도
        try {
          console.log(`  🔄 ${key} 대안 방법으로 재시도...`);
          execSync(`echo "${value}" | vercel env add ${key} ${env}`, { stdio: 'inherit' });
          console.log(`  ✅ ${key} 대안 방법으로 설정 완료`);
        } catch (altError) {
          console.log(`  ❌ ${key} 대안 방법도 실패: ${altError.message}`);
        }
      }
    }
    
    console.log(`✅ ${env} 환경 설정 완료\n`);
  }
}

// 환경변수 설정 실행
setupEnvironments().then(() => {
  console.log('🎉 모든 환경변수 설정 완료!');
  console.log('\n📋 설정된 환경변수:');
  Object.keys(ENV_VARS).forEach(key => {
    console.log(`  - ${key}`);
  });
  
  console.log('\n🔄 다음 단계:');
  console.log('1. vercel --prod 명령으로 배포');
  console.log('2. 배포 완료 후 https://your-app.vercel.app/debug 페이지 확인');
  console.log('3. Supabase Dashboard에서 Site URL 업데이트');
  console.log('   - Site URL: https://your-app.vercel.app');
  console.log('   - Redirect URL: https://your-app.vercel.app/auth/callback');
}).catch(error => {
  console.error('❌ 환경변수 설정 중 오류 발생:', error);
  process.exit(1);
});

function promiseifySpawn(command, args, input) {
  return new Promise((resolve, reject) => {
    const childProcess = require('child_process').spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (input) {
      childProcess.stdin.write(input + '\n');
      childProcess.stdin.end();
    }
    
    let stdout = '';
    let stderr = '';
    
    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Command failed with code ${code}`));
      }
    });
    
    childProcess.on('error', reject);
  });
}