/**
 * news.js — static mock fighter news feed (Phase 5).
 *
 * NewsItem schema:
 * {
 *   id:           String,   // unique slug, e.g. 'news-001'
 *   date:         String,   // ISO date 'YYYY-MM-DD'
 *   fighter_id:   Number|null,  // matches FIGHTERS[n].id; null for general/multi-fighter items
 *   fighter_name: String|null,  // display name, null if fighter_id is null
 *   category:     String,   // 'fight' | 'injury' | 'camp' | 'weigh-in' | 'result'
 *   headline:     String,   // short headline (≤80 chars)
 *   body:         String,   // 2–4 sentence detail paragraph
 *   source:       String,   // publication name only — no live URLs in mock data
 *   relevance:    String,   // 'high' | 'medium' | 'low' — trading signal strength
 * }
 *
 * Sorted newest-first for display. fighter_id maps to FIGHTERS.id (1-indexed).
 */

export const NEWS = [
  {
    id: 'news-001',
    date: '2026-03-14',
    fighter_id: 1,
    fighter_name: 'Islam Makhachev',
    category: 'fight',
    headline: 'Makhachev vs Tsarukyan 2 officially booked for UFC 316',
    body: 'UFC has confirmed the rematch between lightweight champion Islam Makhachev and Arman Tsarukyan as the main event of UFC 316 on June 7. The first meeting saw Makhachev submit Tsarukyan in the third round. Tsarukyan has since gone 3-0 and earned mandatory contender status, making this the most anticipated lightweight title fight in years.',
    source: 'UFC.com',
    relevance: 'high',
  },
  {
    id: 'news-002',
    date: '2026-03-13',
    fighter_id: 6,
    fighter_name: 'Arman Tsarukyan',
    category: 'camp',
    headline: 'Tsarukyan adds Khabib-era wrestling coach ahead of title shot',
    body: 'Arman Tsarukyan has brought in Rustam Khabilov as a specialized wrestling coach for his UFC 316 camp. Tsarukyan\'s wrestling defense has been his most cited weakness since the first Makhachev fight. Sources close to the camp describe the addition as targeted preparation to neutralize Makhachev\'s dominant grappling game.',
    source: 'MMA Fighting',
    relevance: 'high',
  },
  {
    id: 'news-003',
    date: '2026-03-12',
    fighter_id: 4,
    fighter_name: 'Charles Oliveira',
    category: 'injury',
    headline: 'Oliveira pulls from UFC Fight Night — rib injury confirmed',
    body: 'Charles Oliveira has been withdrawn from his scheduled UFC Fight Night bout against Dariush after an MRI confirmed a fractured rib sustained in training. No return timeline has been given by his management. This marks the second consecutive withdrawal for Oliveira in twelve months, raising questions about his availability ahead of any title contention push.',
    source: 'MMA Junkie',
    relevance: 'high',
  },
  {
    id: 'news-004',
    date: '2026-03-11',
    fighter_id: 11,
    fighter_name: 'Tom Aspinall',
    category: 'fight',
    headline: 'Aspinall vs Jones unification bout targeting UFC 317 — sources',
    body: 'Multiple sources indicate the UFC is targeting a heavyweight unification bout between interim champion Tom Aspinall and Jon Jones at UFC 317 on July 5. Contract negotiations are ongoing and no official announcement has been made. Aspinall has publicly stated his willingness to fight Jones anywhere, while Jones\'s team has gone quiet on social media.',
    source: 'ESPN MMA',
    relevance: 'high',
  },
  {
    id: 'news-005',
    date: '2026-03-10',
    fighter_id: 10,
    fighter_name: 'Jon Jones',
    category: 'injury',
    headline: 'Jones seen leaving clinic — USADA clearance status unconfirmed',
    body: 'Jon Jones was photographed entering a sports medicine clinic in Albuquerque on Tuesday. His team declined to comment on the nature of the visit. Jones last competed at UFC 309 where he successfully defended against Stipe Miocic. USADA has not issued any public statement regarding his testing status for the current quarter.',
    source: 'Bloody Elbow',
    relevance: 'medium',
  },
  {
    id: 'news-006',
    date: '2026-03-09',
    fighter_id: 7,
    fighter_name: 'Belal Muhammad',
    category: 'fight',
    headline: 'Muhammad vs Della Maddalena confirmed as UFC 315 co-main',
    body: 'The UFC has officially confirmed Belal Muhammad will defend his welterweight title against Jack Della Maddalena at UFC 315 on May 10 in Montreal. Della Maddalena earned the title shot with a dominant TKO over Gilbert Burns. This will be Muhammad\'s second title defense after his dominant win over Leon Edwards last year.',
    source: 'UFC.com',
    relevance: 'high',
  },
  {
    id: 'news-007',
    date: '2026-03-08',
    fighter_id: 9,
    fighter_name: 'Jack Della Maddalena',
    category: 'camp',
    headline: 'Della Maddalena camp relocating to Las Vegas for title fight prep',
    body: 'Jack Della Maddalena and his team from Acrobat MMA in Perth will base their UFC 315 camp out of Las Vegas to access top wrestling resources. The move is specifically aimed at closing the wrestling gap with Belal Muhammad, who is regarded as one of the best wrestlers in the welterweight division. Della Maddalena has brought in multiple former collegiate wrestling champions as sparring partners.',
    source: 'The Mac Life',
    relevance: 'medium',
  },
  {
    id: 'news-008',
    date: '2026-03-07',
    fighter_id: 12,
    fighter_name: 'Sean O\'Malley',
    category: 'weigh-in',
    headline: 'O\'Malley flagged for early weight cut concerns at UFC 316 open workouts',
    body: 'Reporters at the UFC 316 open workouts noted that Sean O\'Malley appeared visibly heavier than his typical fight-week weight, raising questions about his weight cut timeline. O\'Malley has previously struggled with late cuts and spent time at 145 in training. His coach Tim Welch dismissed concerns, stating O\'Malley is "right on schedule."',
    source: 'MMA Mania',
    relevance: 'medium',
  },
  {
    id: 'news-009',
    date: '2026-03-06',
    fighter_id: 5,
    fighter_name: 'Justin Gaethje',
    category: 'result',
    headline: 'Gaethje TKO loss to Tsarukyan at UFC Fight Night — full recap',
    body: 'Justin Gaethje suffered a second-round TKO defeat to Arman Tsarukyan at last Saturday\'s UFC Fight Night. Tsarukyan dropped Gaethje with a right hand in round two and finished with ground strikes. The loss drops Gaethje to #6 in the lightweight rankings. His team has confirmed a post-fight medical suspension of 60 days.',
    source: 'MMA Fighting',
    relevance: 'medium',
  },
  {
    id: 'news-010',
    date: '2026-03-05',
    fighter_id: 14,
    fighter_name: 'Merab Dvalishvili',
    category: 'fight',
    headline: 'Dvalishvili title defense vs O\'Malley 2 in final negotiations',
    body: 'The UFC is finalizing a bantamweight title rematch between champion Merab Dvalishvili and Sean O\'Malley for UFC 316 on June 7. The first meeting saw Dvalishvili win a unanimous decision in a grueling, grappling-heavy affair. O\'Malley is pushing for a different game plan with new striking coach Jason Parillo joining his team.',
    source: 'MMA Junkie',
    relevance: 'high',
  },
  {
    id: 'news-011',
    date: '2026-03-04',
    fighter_id: 3,
    fighter_name: 'Paddy Pimblett',
    category: 'weigh-in',
    headline: 'Pimblett misses weight by 2.5 lbs at UFC Fight Night — bout proceeds at catchweight',
    body: 'Paddy Pimblett weighed in at 157.5 lbs for his UFC Fight Night lightweight bout, missing the 156 lb non-title limit. His opponent accepted the catchweight bout after receiving 20% of Pimblett\'s purse. This is the second weight miss for Pimblett in four fights and has prompted renewed discussion within the UFC about a permanent move to welterweight.',
    source: 'MMA Junkie',
    relevance: 'high',
  },
  {
    id: 'news-012',
    date: '2026-03-03',
    fighter_id: 8,
    fighter_name: 'Leon Edwards',
    category: 'camp',
    headline: 'Edwards parts ways with long-time coach Dave Lovell',
    body: 'Leon Edwards has announced a split from lead striking coach Dave Lovell, who has worked with him since 2018. The separation is described as mutual and amicable. Edwards has not announced a replacement and is currently between fights. The camp change may signal a shift in his approach as he looks to reclaim the welterweight title from Belal Muhammad.',
    source: 'BBC Sport MMA',
    relevance: 'medium',
  },
];
