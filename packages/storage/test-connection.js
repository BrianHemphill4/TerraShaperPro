#!/usr/bin/env node

// Simple test script to verify Google Cloud Storage connection
// Run this with: node test-connection.js

require('dotenv').config({ path: '../../.env.local' });

// Override global environment variables with local ones
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/Users/brianhemphill/Documents/terrashaperpro-3cb18210f21f.json';

async function testGCSConnection() {
  try {
    console.log('🔍 Testing Google Cloud Storage connection...\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('- GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID || '❌ Missing');
    console.log('- GCS_RENDERS_BUCKET:', process.env.GCS_RENDERS_BUCKET || '❌ Missing');
    console.log('- GCS_ASSETS_BUCKET:', process.env.GCS_ASSETS_BUCKET || '❌ Missing');
    console.log('- GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || '❌ Missing');
    console.log('');

    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_RENDERS_BUCKET || !process.env.GCS_ASSETS_BUCKET) {
      throw new Error('Missing required environment variables');
    }

    // Test Google Cloud Storage client
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    console.log('✅ Google Cloud Storage client initialized');

    // Test bucket access
    const rendersBucket = storage.bucket(process.env.GCS_RENDERS_BUCKET);
    const assetsBucket = storage.bucket(process.env.GCS_ASSETS_BUCKET);

    console.log('🪣 Testing bucket access...');
    
    // Check if buckets exist
    const [rendersExists] = await rendersBucket.exists();
    const [assetsExists] = await assetsBucket.exists();

    console.log(`- ${process.env.GCS_RENDERS_BUCKET}:`, rendersExists ? '✅ Accessible' : '❌ Not accessible');
    console.log(`- ${process.env.GCS_ASSETS_BUCKET}:`, assetsExists ? '✅ Accessible' : '❌ Not accessible');

    if (!rendersExists || !assetsExists) {
      throw new Error('One or more buckets are not accessible');
    }

    // Test upload capability with a small test file
    console.log('\n📤 Testing upload capability...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'Hello from TerraShaperPro!';
    
    const file = rendersBucket.file(testFileName);
    await file.save(testContent, {
      metadata: {
        contentType: 'text/plain',
      },
    });
    
    console.log('✅ Test file uploaded successfully');

    // Test download capability
    console.log('📥 Testing download capability...');
    const [downloadedContent] = await file.download();
    const downloadedText = downloadedContent.toString();
    
    if (downloadedText === testContent) {
      console.log('✅ Test file downloaded and verified');
    } else {
      throw new Error('Downloaded content does not match uploaded content');
    }

    // Clean up test file
    await file.delete();
    console.log('🗑️  Test file cleaned up');

    // Test signed URL generation
    console.log('\n🔐 Testing signed URL generation...');
    const [signedUrl] = await rendersBucket.file('test-signed-url.txt').getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'text/plain',
    });
    
    if (signedUrl) {
      console.log('✅ Signed URL generated successfully');
    } else {
      throw new Error('Failed to generate signed URL');
    }

    console.log('\n🎉 All tests passed! Google Cloud Storage is properly configured.');
    
  } catch (error) {
    console.error('\n❌ Error testing Google Cloud Storage:');
    console.error(error.message);
    
    if (error.message.includes('Could not load the default credentials')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Make sure the service account key file exists at the specified path');
      console.error('2. Verify the GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly');
      console.error('3. Check that the service account has the necessary permissions');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  testGCSConnection();
}