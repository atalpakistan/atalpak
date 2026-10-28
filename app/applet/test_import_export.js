const fs = require('fs');

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- STARTING AUTOMATED IMPORT/EXPORT TESTS ---');

  // TEST 1: Export full store backup and validate
  console.log('\nTEST 1: Exporting full store backup...');
  const expRes = await fetch(`${baseUrl}/api/admin/export-data?type=all`);
  if (!expRes.ok) throw new Error(`Export failed with status ${expRes.status}`);
  const fullBackupText = await expRes.text();
  console.log(`Exported Full Backup size: ${fullBackupText.length} bytes`);

  const valRes1 = await fetch(`${baseUrl}/api/admin/validate-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent: fullBackupText })
  });
  const valData1 = await valRes1.json();
  console.log('TEST 1 Validation Result:', {
    isValid: valData1.isValid,
    detectedFormat: valData1.detectedFormat,
    inferredDataset: valData1.inferredDataset
  });
  if (!valData1.isValid || valData1.inferredDataset !== 'Full Store Backup') {
    throw new Error(`TEST 1 Failed: expected Full Store Backup, got ${valData1.inferredDataset}`);
  }

  // TEST 2: Products-only backup
  console.log('\nTEST 2: Exporting products-only backup...');
  const prodExpRes = await fetch(`${baseUrl}/api/admin/export-data?type=products`);
  const prodBackupText = await prodExpRes.text();
  const valRes2 = await fetch(`${baseUrl}/api/admin/validate-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent: prodBackupText })
  });
  const valData2 = await valRes2.json();
  console.log('TEST 2 Validation Result:', {
    isValid: valData2.isValid,
    inferredDataset: valData2.inferredDataset
  });
  if (!valData2.isValid || valData2.inferredDataset !== 'Product Catalog') {
    throw new Error(`TEST 2 Failed: expected Product Catalog, got ${valData2.inferredDataset}`);
  }

  // TEST 3: Categories-only backup
  console.log('\nTEST 3: Exporting categories-only backup...');
  const catExpRes = await fetch(`${baseUrl}/api/admin/export-data?type=categories`);
  const catBackupText = await catExpRes.text();
  const valRes3 = await fetch(`${baseUrl}/api/admin/validate-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent: catBackupText })
  });
  const valData3 = await valRes3.json();
  console.log('TEST 3 Validation Result:', {
    isValid: valData3.isValid,
    inferredDataset: valData3.inferredDataset
  });
  if (!valData3.isValid || valData3.inferredDataset !== 'Categories & Subcategories') {
    throw new Error(`TEST 3 Failed: expected Categories & Subcategories, got ${valData3.inferredDataset}`);
  }

  // TEST 4: Empty JSON Array []
  console.log('\nTEST 4: Importing empty JSON array []...');
  const valRes4 = await fetch(`${baseUrl}/api/admin/validate-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent: '[]' })
  });
  const valData4 = await valRes4.json();
  console.log('TEST 4 Validation Result:', {
    isValid: valData4.isValid,
    requiresDatasetSelection: valData4.requiresDatasetSelection,
    inferredDataset: valData4.inferredDataset
  });
  if (!valData4.requiresDatasetSelection) {
    throw new Error('TEST 4 Failed: empty array should require dataset selection');
  }

  // TEST 4b: Empty JSON Array with selectedDatasetType override = 'products'
  console.log('TEST 4b: Empty array with selectedDatasetType = "products"...');
  const valRes4b = await fetch(`${baseUrl}/api/admin/validate-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent: '[]', selectedDatasetType: 'products' })
  });
  const valData4b = await valRes4b.json();
  console.log('TEST 4b Validation Result:', {
    isValid: valData4b.isValid,
    inferredDataset: valData4b.inferredDataset
  });
  if (!valData4b.isValid || valData4b.inferredDataset !== 'Product Catalog') {
    throw new Error(`TEST 4b Failed: got ${valData4b.inferredDataset}`);
  }

  // TEST 5: Malformed JSON
  console.log('\nTEST 5: Importing malformed JSON...');
  const valRes5 = await fetch(`${baseUrl}/api/admin/validate-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent: '{ "name": "bad json", ' })
  });
  const valData5 = await valRes5.json();
  console.log('TEST 5 Validation Result:', {
    isValid: valData5.isValid,
    error: valData5.error || valData5.errors
  });
  if (valData5.isValid) {
    throw new Error('TEST 5 Failed: malformed JSON should fail validation');
  }

  // TEST 6: Importing full backup in update_existing mode
  console.log('\nTEST 6: Executing full backup import in update_existing mode...');
  const impRes = await fetch(`${baseUrl}/api/admin/import-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent: fullBackupText, mode: 'update_existing' })
  });
  const impData = await impRes.json();
  console.log('TEST 6 Import Result:', {
    success: impData.success,
    autoBackupId: impData.autoBackupId,
    stats: impData.stats
  });
  if (!impData.success) {
    throw new Error(`TEST 6 Failed: import failed - ${impData.error}`);
  }

  console.log('\nALL AUTOMATED TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
