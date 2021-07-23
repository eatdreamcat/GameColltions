declare namespace b2 {
  declare var maxPolygonVertices: number;
  export class BodyDef {
    allowSleep: boolean;
    gravityScale: number;
    linearDamping: number;
    angularDamping: number;
    type: BodyType;
    angle: number;
    bullet: boolean;
    fixedRotation: boolean;
  }

  export class Vec2 {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  export class Body {
    name: string;
    data: any;
    m_bulletFlag: boolean;

    SetPosition(position: Vec2);
    SetPositionXY(x: number, y: number);
    GetPosition(): Vec2;
    GetAngle(): number;
    SetAngle(angle: number);
    SetSleepingAllowed(allow: boolean);
    IsAwake(): boolean;
    CreateFixture(fixture: FixtureDef | Shape);
    SyncTransform();
  }

  export class Draw {}

  export class World {
    m_OffsetLimit: number;
    m_AngleLimit: number;
    m_StaticRefLimit: number;
    m_VelocityLimit: number;
    constructor(gravity: Vec2);
    CreateBody(def: BodyDef): Body;
    DestroyBody(body: Body);
    Step(
      dt: number,
      velocityIterations: number,
      positionIterations: number,
      particleIterations?: number
    );
    SetAllDynamic2Static();
    SetAllowSleeping(flag: boolean);
    SetGravity(gravity: Vec2, wake: boolean = true);
    SetAutoClearForces(flag: boolean);
    Dump(log: Function);
    IsAllSleepingNow(): boolean;
    IsAllDynamicBodySleepingNow(): boolean;
    SetDebugDraw(debugDraw: Draw);
    DrawDebugData();
    ClearDebugDraw();
    SyncDynamicTransform(
      callback: (body: Body, offset: Vec2, deltaAngle: number) => void
    );
  }

  export enum DrawFlags {
    e_aabbBit,
    e_all,
    e_centerOfMassBit = 16,
    e_controllerBit = 64,
    e_jointBit = 2,
    e_none = 0,
    e_pairBit = 8,
    e_particleBit = 32,
    e_shapeBit = 1,
  }

  export class Shape {}
  export class PolygonShape extends Shape {
    /**
     * var x = (p.x + offset.x)/PTM_RATIO*scale.x;
     * var y = (p.y + offset.y)/PTM_RATIO*scale.y;
     * @param vertices
     * @param count
     * @param start
     */
    Set(vertices: Vec2[], count: number = vertices.length, start: number = 0);
    Copy(other: PolygonShape): PolygonShape;
    Clone(): PolygonShape;
    SetAsBox(
      halfWidth: number,
      halfHeight: number,
      center: Vec2,
      angle: number = 0
    );
  }

  /** Math.random() * 2 - 1; */
  export function b2Random(): number;
  /** return (hi - lo) * Math.random() + lo; */
  export function b2RandomRange(lo: number, hi: number): number;

  export enum ShapeType {
    e_chainShape = 3,
    e_circleShape = 0,
    e_edgeShape = 1,
    e_polygonShape = 2,
    e_shapeTypeCount = 4,
    e_unknown = -1,
  }

  export enum BodyType {
    b2_dynamicBody = 2,
    b2_kinematicBody = 1,
    b2_staticBody = 0,
    b2_unknown = -1,
  }

  export class EdgeShape {
    Set(v1: Vec2, v2: Vec2);
  }

  export class FixtureDef {
    density: number;
    isSensor: boolean;
    friction: number;
    restitution: number;
    shape: Shape;
  }

  export class Fixture {}
}
