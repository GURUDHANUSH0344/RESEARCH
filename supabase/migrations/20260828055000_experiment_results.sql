CREATE TABLE IF NOT EXISTS public.experiment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.experiments ON DELETE CASCADE,
  project_id UUID REFERENCES public.research_projects ON DELETE CASCADE,
  file_name TEXT,
  file_url TEXT,
  raw_data JSONB,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiment_results TO authenticated;
GRANT ALL ON public.experiment_results TO service_role;
ALTER TABLE public.experiment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own experiment_results" ON public.experiment_results FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE (p.id = project_id OR EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = experiment_id AND e.project_id = p.id)) AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE (p.id = project_id OR EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = experiment_id AND e.project_id = p.id)) AND p.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_exp_results_proj ON public.experiment_results(project_id);
