CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  research_question TEXT NOT NULL,
  research_field TEXT,
  objective TEXT,
  year_from INT,
  year_to INT,
  paper_limit INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending',
  synthesis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_projects TO authenticated;
GRANT ALL ON public.research_projects TO service_role;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects" ON public.research_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects ON DELETE CASCADE,
  external_id TEXT,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  abstract TEXT,
  year INT,
  doi TEXT,
  url TEXT,
  venue TEXT,
  citation_count INT NOT NULL DEFAULT 0,
  source TEXT,
  open_access BOOLEAN NOT NULL DEFAULT false,
  concepts TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.papers TO authenticated;
GRANT ALL ON public.papers TO service_role;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own papers" ON public.papers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TABLE public.paper_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES public.papers ON DELETE CASCADE,
  problem TEXT,
  objective TEXT,
  methodology TEXT,
  dataset TEXT,
  experimental_setup TEXT,
  results TEXT,
  limitations TEXT[] NOT NULL DEFAULT '{}',
  future_work TEXT[] NOT NULL DEFAULT '{}',
  contributions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_analysis TO authenticated;
GRANT ALL ON public.paper_analysis TO service_role;
ALTER TABLE public.paper_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own analysis" ON public.paper_analysis FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.papers pa JOIN public.research_projects p ON p.id = pa.project_id WHERE pa.id = paper_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.papers pa JOIN public.research_projects p ON p.id = pa.project_id WHERE pa.id = paper_id AND p.user_id = auth.uid()));

CREATE TABLE public.research_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  evidence TEXT,
  why_it_matters TEXT,
  supporting_papers TEXT[] NOT NULL DEFAULT '{}',
  potential_question TEXT,
  confidence TEXT,
  novelty INT,
  feasibility INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_gaps TO authenticated;
GRANT ALL ON public.research_gaps TO service_role;
ALTER TABLE public.research_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own gaps" ON public.research_gaps FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TABLE public.contradictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects ON DELETE CASCADE,
  topic TEXT,
  finding_a TEXT,
  finding_b TEXT,
  paper_a TEXT,
  paper_b TEXT,
  possible_explanation TEXT,
  confidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contradictions TO authenticated;
GRANT ALL ON public.contradictions TO service_role;
ALTER TABLE public.contradictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contradictions" ON public.contradictions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TABLE public.hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects ON DELETE CASCADE,
  label TEXT,
  statement TEXT NOT NULL,
  rationale TEXT,
  evidence TEXT,
  independent_variable TEXT,
  dependent_variable TEXT,
  expected_outcome TEXT,
  novelty_score NUMERIC,
  feasibility_score NUMERIC,
  impact_score NUMERIC,
  overall_score NUMERIC,
  selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hypotheses TO authenticated;
GRANT ALL ON public.hypotheses TO service_role;
ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hypotheses" ON public.hypotheses FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TABLE public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects ON DELETE CASCADE,
  hypothesis_id UUID REFERENCES public.hypotheses ON DELETE SET NULL,
  plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiments TO authenticated;
GRANT ALL ON public.experiments TO service_role;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own experiments" ON public.experiments FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.reports FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE INDEX idx_papers_project ON public.papers(project_id);
CREATE INDEX idx_gaps_project ON public.research_gaps(project_id);
CREATE INDEX idx_hyp_project ON public.hypotheses(project_id);
CREATE INDEX idx_projects_user ON public.research_projects(user_id);