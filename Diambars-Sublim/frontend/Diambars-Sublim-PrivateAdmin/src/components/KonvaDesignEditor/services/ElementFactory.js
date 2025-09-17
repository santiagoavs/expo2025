// services/ElementFactory.js
export class ElementFactory {
  generateId() {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createTextElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'text',
      text: config.text || 'Nuevo texto',
      x: config.x || 0,
      y: config.y || 0,
      fontSize: config.fontSize || 24,
      fontFamily: config.fontFamily || 'Arial',
      fill: config.fill || '#000000',
      width: config.width || 200,
      align: config.align || 'left',
      verticalAlign: config.verticalAlign || 'top',
      ...config
    };
  }

  createImageElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'image',
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 100,
      height: config.height || 100,
      imageUrl: config.imageUrl,
      image: config.image,
      originalName: config.originalName,
      originalSize: config.originalSize,
      ...config
    };
  }

  createRectElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'rect',
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 100,
      height: config.height || 80,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      cornerRadius: config.cornerRadius || 0,
      ...config
    };
  }

  createCircleElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'circle',
      x: config.x || 0,
      y: config.y || 0,
      radius: config.radius || 50,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      ...config
    };
  }

  createTriangleElement(config) {
    const points = config.points || [0, 50, 50, 0, 100, 50];
    return {
      id: config.id || this.generateId(),
      type: 'triangle',
      x: config.x || 0,
      y: config.y || 0,
      points: points,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      closed: true,
      ...config
    };
  }

  createStarElement(config) {
    const { numPoints = 5, innerRadius = 20, outerRadius = 40 } = config;
    const points = this.generateStarPoints(numPoints, innerRadius, outerRadius);
    
    return {
      id: config.id || this.generateId(),
      type: 'star',
      x: config.x || 0,
      y: config.y || 0,
      points: points,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      closed: true,
      ...config
    };
  }

  createCustomShapeElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'customShape',
      x: config.x || 0,
      y: config.y || 0,
      points: config.points || [],
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      closed: config.closed !== false,
      ...config
    };
  }

  generateStarPoints(numPoints, innerRadius, outerRadius) {
    const points = [];
    const step = Math.PI / numPoints;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      points.push(Math.cos(angle) * radius + outerRadius);
      points.push(Math.sin(angle) * radius + outerRadius);
    }
    
    return points;
  }
}
