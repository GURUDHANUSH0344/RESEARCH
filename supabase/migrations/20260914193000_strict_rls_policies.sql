-- Migration: Strict User-Level Data Isolation & RLS Hardening
-- Guarantees that every user-owned record is strictly accessible ONLY by its authenticated owner (auth.uid()).

-- 1. Enable RLS across all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.paper_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contradictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.experiment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_chats ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to cleanly re-create strict policies
DROP POLICY IF EXISTS "strict_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "strict_own_projects" ON public.research_projects;
DROP POLICY IF EXISTS "strict_own_papers" ON public.papers;
DROP POLICY IF EXISTS "strict_own_paper_analysis" ON public.paper_analysis;
DROP POLICY IF EXISTS "strict_own_gaps" ON public.research_gaps;
DROP POLICY IF EXISTS "strict_own_contradictions" ON public.contradictions;
DROP POLICY IF EXISTS "strict_own_hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "strict_own_experiments" ON public.experiments;
DROP POLICY IF EXISTS "strict_own_experiment_results" ON public.experiment_results;
DROP POLICY IF EXISTS "strict_own_reports" ON public.reports;
DROP POLICY IF EXISTS "strict_own_notes" ON public.research_notes;
DROP POLICY IF EXISTS "strict_own_tasks" ON public.research_tasks;
DROP POLICY IF EXISTS "strict_own_findings" ON public.research_findings;
DROP POLICY IF EXISTS "strict_own_timeline" ON public.research_timeline;
DROP POLICY IF EXISTS "strict_own_chats" ON public.research_chats;

-- 3. Profiles: Only authenticated user can view, insert, update their own profile
CREATE POLICY "strict_own_profile" ON public.profiles
FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Research Projects: Primary owner policy
CREATE POLICY "strict_own_projects" ON public.research_projects
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Child tables strictly verifying project ownership
CREATE POLICY "strict_own_papers" ON public.papers
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_paper_analysis" ON public.paper_analysis
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.papers pa JOIN public.research_projects p ON p.id = pa.project_id WHERE pa.id = paper_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.papers pa JOIN public.research_projects p ON p.id = pa.project_id WHERE pa.id = paper_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_gaps" ON public.research_gaps
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_contradictions" ON public.contradictions
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_hypotheses" ON public.hypotheses
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_experiments" ON public.experiments
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_experiment_results" ON public.experiment_results
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.experiments e JOIN public.research_projects p ON p.id = e.project_id WHERE e.id = experiment_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.experiments e JOIN public.research_projects p ON p.id = e.project_id WHERE e.id = experiment_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_reports" ON public.reports
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_notes" ON public.research_notes
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_tasks" ON public.research_tasks
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_findings" ON public.research_findings
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_timeline" ON public.research_timeline
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "strict_own_chats" ON public.research_chats
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
