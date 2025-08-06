import React from 'react';
import { createClassName, COMPONENT_IDENTIFIERS } from '../../utils/ClassNames';
import './StatCard.css';

const STAT_CARD_ID = COMPONENT_IDENTIFIERS.STAT_CARD;

const StatCard = ({ 
  number, 
  title, 
  IconComponent, 
  iconColor = 'sc-icon-default',
  size = 'medium',
  trend = null,
  trendDirection = 'up',
  isLoading = false,
  onClick = null,
  className = ''
}) => {
  const classes = {
    card: createClassName(STAT_CARD_ID, 'card'),
    content: createClassName(STAT_CARD_ID, 'content'),
    info: createClassName(STAT_CARD_ID, 'info'),
    number: createClassName(STAT_CARD_ID, 'number'),
    title: createClassName(STAT_CARD_ID, 'title'),
    iconContainer: createClassName(STAT_CARD_ID, 'icon-container'),
    icon: createClassName(STAT_CARD_ID, 'icon'),
    trend: createClassName(STAT_CARD_ID, 'trend'),
    trendIcon: createClassName(STAT_CARD_ID, 'trend-icon'),
    trendValue: createClassName(STAT_CARD_ID, 'trend-value'),
    loading: createClassName(STAT_CARD_ID, 'loading'),
    loadingShimmer: createClassName(STAT_CARD_ID, 'loading-shimmer'),
    sizeModifier: createClassName(STAT_CARD_ID, 'card', size),
    clickable: createClassName(STAT_CARD_ID, 'card', 'clickable')
  };

  const handleClick = () => {
    if (onClick && !isLoading) {
      onClick();
    }
  };

  const cardClassName = [
    classes.card,
    classes.sizeModifier,
    onClick ? classes.clickable : '',
    isLoading ? classes.loading : '',
    className
  ].filter(Boolean).join(' ');

  if (isLoading) {
    return (
      <div className={cardClassName}>
        <div className={classes.content}>
          <div className={classes.info}>
            <div className={`${classes.number} ${classes.loadingShimmer}`}></div>
            <div className={`${classes.title} ${classes.loadingShimmer}`}></div>
          </div>
          <div className={`${classes.iconContainer} ${classes.loadingShimmer}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName} onClick={handleClick}>
      <div className={classes.content}>
        <div className={classes.info}>
          <div className={classes.number}>
            {number}
            {trend && (
              <div className={`${classes.trend} ${classes.trend}--${trendDirection}`}>
                <span className={classes.trendIcon}>
                  {trendDirection === 'up' ? '↗' : '↘'}
                </span>
                <span className={classes.trendValue}>{trend}</span>
              </div>
            )}
          </div>
          <div className={classes.title}>{title}</div>
        </div>
        
        <div className={`${classes.iconContainer} ${iconColor}`}>
          {IconComponent && (
            <IconComponent className={classes.icon} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;