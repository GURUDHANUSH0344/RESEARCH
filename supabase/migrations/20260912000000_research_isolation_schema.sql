-- Migration: Research Isolation Schema
-- Adds research_notes, research_tasks, research_findings, research_timeline, and research_chats
-- All entities strictly isolate data by project_id (Research ID) and cascade delete on project removal.

-- 1. Research Notes
CREATE TABLE IF NOT EXISTS public.research_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_notes TO authenticated;
GRANT ALL ON public.research_notes TO service_role;
ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.research_notes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_research_notes_project ON public.research_notes(project_id);

-- 2. Research Tasks
CREATE TABLE IF NOT EXISTS public.research_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_tasks TO authenticated;
GRANT ALL ON public.research_tasks TO service_role;
ALTER TABLE public.research_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.research_tasks FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_research_tasks_project ON public.research_tasks(project_id);

-- 3. Research Findings
CREATE TABLE IF NOT EXISTS public.research_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'finding',
  description TEXT NOT NULL,
  evidence TEXT,
  supporting_papers TEXT[] NOT NULL DEFAULT '{}',
  novelty INT,
  feasibility INT,
  confidence TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_findings TO authenticated;
GRANT ALL ON public.research_findings TO service_role;
ALTER TABLE public.research_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own findings" ON public.research_findings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_research_findings_project ON public.research_findings(project_id);

-- 4. Research Timeline
CREATE TABLE IF NOT EXISTS public.research_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_timeline TO authenticated;
GRANT ALL ON public.research_timeline TO service_role;
ALTER TABLE public.research_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own timeline" ON public.research_timeline FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_research_timeline_project ON public.research_timeline(project_id);

-- 5. Research Chats
CREATE TABLE IF NOT EXISTS public.research_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_chats TO authenticated;
GRANT ALL ON public.research_chats TO service_role;
ALTER TABLE public.research_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chats" ON public.research_chats FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_research_chats_project ON public.research_chats(project_id);
