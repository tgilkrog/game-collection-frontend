import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './FilterPanel.module.css';
import { collapseVariants, collapseTransition } from '../../utils/motion';

export interface FacetOption {
  id: number;
  name: string;
}

export interface FacetConfig {
  key: string;
  label: string;
  options: FacetOption[];
}

interface FilterPanelProps {
  facets: FacetConfig[];
  activeFilters: Record<string, number[]>;
  onToggle: (facetKey: string, optionId: number) => void;
  onClear?: () => void;
}

export function FilterPanel({ facets, activeFilters, onToggle, onClear }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFacet, setExpandedFacet] = useState<string | null>(null);

  const visibleFacets = facets.filter(f => f.options.length > 0);
  const activeCount = Object.values(activeFilters).reduce((sum, ids) => sum + ids.length, 0);

  if (visibleFacets.length === 0) return null;

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.toggle_btn}
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        FILTERS
        {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        <span className={`${styles.chevron} ${isOpen ? styles.chevron_open : ''}`}>▾</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={styles.facets}
            variants={collapseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={collapseTransition}
          >
          {visibleFacets.map(facet => {
            const selected = activeFilters[facet.key] ?? [];
            const expanded = expandedFacet === facet.key;
            return (
              <div key={facet.key} className={styles.facet}>
                <button
                  type="button"
                  className={styles.facet_header}
                  onClick={() => setExpandedFacet(expanded ? null : facet.key)}
                  aria-expanded={expanded}
                >
                  {facet.label}
                  {selected.length > 0 && <span className={styles.badge}>{selected.length}</span>}
                  <span className={`${styles.chevron} ${expanded ? styles.chevron_open : ''}`}>▾</span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      className={styles.chip_row}
                      variants={collapseVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={collapseTransition}
                    >
                      {facet.options.map(option => {
                        const active = selected.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={`${styles.chip} ${active ? styles.chip_active : ''}`}
                            onClick={() => onToggle(facet.key, option.id)}
                          >
                            {option.name}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {activeCount > 0 && onClear && (
            <button type="button" className={styles.clear_btn} onClick={onClear}>
              CLEAR ALL FILTERS
            </button>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
