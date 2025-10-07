/**
 * Types for the Craft.js Page Builder System
 */

// ============================================
// Core Node & Page Types
// ============================================

export interface CraftNode {
  id: string;
  type: string;
  children: string[];
  props: Record<string, unknown>;
  dataBinding?: DataBinding;
  visibilityRules?: VisibilityRule[];
  version: string;
}

export interface CraftPage {
  rootNodeId: string;
  nodes: Record<string, CraftNode>;
}

// ============================================
// Data Binding System
// ============================================

export interface DataBinding {
  table: string;
  select: string[];
  where?: WhereClause[];
  orderBy?: OrderByClause[];
  limit?: number;
  runtime: 'build' | 'client';
}

export interface WhereClause {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: unknown;
}

export interface OrderByClause {
  column: string;
  ascending: boolean;
}

// ============================================
// Visibility Rules
// ============================================

export interface VisibilityRule {
  type: 'condition' | 'date_range' | 'user_role';
  condition?: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
    value: unknown;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  userRoles?: string[];
}

// ============================================
// Template System
// ============================================

export interface BuilderTemplate {
  id: string;
  org_id?: string;
  key: string;
  label: string;
  description?: string;
  schema: CraftPage;
  preview_image?: string;
  category?: string;
  tags?: string[];
  version: string;
  is_public: boolean;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  key: string;
  label: string;
  icon?: string;
}

// ============================================
// Site & Page Management
// ============================================

export interface BuilderSite {
  id: string;
  org_id?: string;
  event_id?: string;
  name: string;
  site_slug: string;
  domain_custom?: string;
  theme_tokens: ThemeTokens;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface BuilderPage {
  id: string;
  site_id: string;
  template_id?: string;
  name: string;
  slug: string;
  tree: CraftPage;
  status: 'draft' | 'published';
  version: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PageVersion {
  id: string;
  page_id: string;
  version: number;
  tree: CraftPage;
  created_at: string;
  created_by?: string;
  label?: string;
}

// ============================================
// Theme & Design Tokens
// ============================================

export interface ThemeTokens {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    border?: string;
  };
  typography?: {
    fontFamily?: string;
    headingFont?: string;
    bodyFont?: string;
  };
  spacing?: {
    unit?: number;
  };
  borderRadius?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  shadows?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}

// ============================================
// Block Library
// ============================================

export interface BuilderBlock {
  id: string;
  key: string;
  label: string;
  description?: string;
  schema: Record<string, unknown>;
  props_meta: BlockPropsMeta;
  preview_image?: string;
  category: string;
  version: string;
  is_custom: boolean;
  created_at: string;
}

export interface BlockPropsMeta {
  content?: BlockPropGroup;
  layout?: BlockPropGroup;
  theme?: BlockPropGroup;
  data?: BlockPropGroup;
}

export interface BlockPropGroup {
  [key: string]: BlockPropDefinition;
}

export interface BlockPropDefinition {
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'date' | 'time';
  label: string;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: unknown }>;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// ============================================
// Domain Management
// ============================================

export interface BuilderDomain {
  id: string;
  site_id: string;
  type: 'subdomain' | 'custom';
  host: string;
  dns_status: 'pending' | 'verified' | 'failed';
  ssl_status: 'pending' | 'provisioning' | 'active' | 'failed';
  is_primary: boolean;
  created_at: string;
  verified_at?: string;
}

export interface DomainVerification {
  host: string;
  type: 'CNAME' | 'A';
  name: string;
  value: string;
  status: 'pending' | 'verified';
}

// ============================================
// Editor State
// ============================================

export interface EditorState {
  selectedNodeId?: string;
  hoveredNodeId?: string;
  clipboardNode?: CraftNode;
  history: EditorHistory;
  isDirty: boolean;
  lastSaved?: string;
}

export interface EditorHistory {
  past: CraftPage[];
  present: CraftPage;
  future: CraftPage[];
}

// ============================================
// Component Props (for Craft.js blocks)
// ============================================

export interface BaseBlockProps {
  className?: string;
  style?: React.CSSProperties;
  dataBinding?: DataBinding;
  visibilityRules?: VisibilityRule[];
}

export interface HeroBlockProps extends BaseBlockProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: 'left' | 'center' | 'right';
  height?: 'small' | 'medium' | 'large' | 'fullscreen';
  overlay?: boolean;
  overlayOpacity?: number;
}

export interface CountdownBlockProps extends BaseBlockProps {
  targetDate: string;
  title?: string;
  description?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

export interface AgendaBlockProps extends BaseBlockProps {
  title?: string;
  groupBy?: 'day' | 'track' | 'room';
  showSpeakers?: boolean;
  allowEnrollment?: boolean;
}

export interface SpeakersBlockProps extends BaseBlockProps {
  title?: string;
  layout?: 'grid' | 'list' | 'carousel';
  columns?: 2 | 3 | 4;
  showBio?: boolean;
  showSocial?: boolean;
}

export interface BilletterieBlockProps extends BaseBlockProps {
  title?: string;
  showAvailability?: boolean;
  showPricing?: boolean;
  ctaText?: string;
}

export interface MapBlockProps extends BaseBlockProps {
  address: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: number;
  showMarker?: boolean;
}

export interface SponsorsBlockProps extends BaseBlockProps {
  title?: string;
  groupByLevel?: boolean;
  layout?: 'grid' | 'logos';
  columns?: 2 | 3 | 4 | 5;
}

export interface FAQBlockProps extends BaseBlockProps {
  title?: string;
  items?: Array<{
    question: string;
    answer: string;
  }>;
  accordion?: boolean;
}

export interface TestimonialsBlockProps extends BaseBlockProps {
  title?: string;
  layout?: 'grid' | 'carousel';
  showAvatar?: boolean;
  showRating?: boolean;
}

export interface FormBlockProps extends BaseBlockProps {
  title?: string;
  formId?: string;
  fields?: Array<{
    name: string;
    type: string;
    label: string;
    required: boolean;
  }>;
  submitText?: string;
  successMessage?: string;
}

export interface TextBlockProps extends BaseBlockProps {
  content: string;
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface GalleryBlockProps extends BaseBlockProps {
  title?: string;
  images?: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4;
}

export interface FooterBlockProps extends BaseBlockProps {
  logo?: string;
  companyName?: string;
  description?: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  copyrightText?: string;
}
