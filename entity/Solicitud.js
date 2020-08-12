import {Entity, PrimaryGeneratedColumn,CreateDateColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import {Provider} from "./Provider";
import {Category} from "./Category";
import {SubscriptionPlan} from "./SubscriptionPlan";
import {Region} from "./Region";
import {Payment} from "./Payment";
import {User} from "./User";
import {ContentType} from "./ContentType";
import {IosCode} from "./IosCode";

@Entity()
export class Solicitud {

  @PrimaryGeneratedColumn()
  id = Number();

  @CreateDateColumn () created;

  @Column ("integer") contentid;

  @Column ("integer") ownerid;

  @Column ("integer") clientid;

  @Column ("integer") typeid;

  //0=pending, 1=approved, 2 =negated
  @Column ("integer") state;

  @Column ("varchar") location;
  @Column ("integer") size;
  @Column ("varchar") extension;

  @Column ("varchar") activecode;
}