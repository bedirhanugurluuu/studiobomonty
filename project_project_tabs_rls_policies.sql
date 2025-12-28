-- Project Project Tabs RLS (Row Level Security) Policies
-- Bu politikalar project_project_tabs tablosuna erişim için gereklidir

-- RLS'yi etkinleştir (eğer zaten etkin değilse)
ALTER TABLE project_project_tabs ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (eğer varsa)
DROP POLICY IF EXISTS "Allow public read access" ON project_project_tabs;
DROP POLICY IF EXISTS "Allow authenticated insert" ON project_project_tabs;
DROP POLICY IF EXISTS "Allow authenticated update" ON project_project_tabs;
DROP POLICY IF EXISTS "Allow authenticated delete" ON project_project_tabs;

-- Policy: Herkes okuyabilir (SELECT)
CREATE POLICY "Allow public read access" ON project_project_tabs
  FOR SELECT
  USING (true);

-- Policy: Authenticated kullanıcılar ekleyebilir (INSERT)
CREATE POLICY "Allow authenticated insert" ON project_project_tabs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated kullanıcılar güncelleyebilir (UPDATE)
CREATE POLICY "Allow authenticated update" ON project_project_tabs
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated kullanıcılar silebilir (DELETE)
CREATE POLICY "Allow authenticated delete" ON project_project_tabs
  FOR DELETE
  USING (auth.role() = 'authenticated');

