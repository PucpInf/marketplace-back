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
export class Content {

  @PrimaryGeneratedColumn()
  id = Number();

  @CreateDateColumn () created;

  @Column ("varchar") title;

  @Column ("varchar") description;

  @Column ({
    type: "varchar",
    nullable: true
}) location;

  @Column ("double") price;

  @Column ("integer") size;

  //0=pending, 1=approved, 2 =negated
  @Column ("integer") state;

  @ManyToMany(type => Category, category => category.contents )
  @JoinTable()
  categories ;

  @ManyToMany(type => User, user => user.contents )
  @JoinTable()
  users ;

  @ManyToMany(type => Region)
  @JoinTable()
  regions ;

  @ManyToOne(type => Provider, owner => owner.contents)
  owner;

  @OneToMany(type => Payment, payment => payment.content)
  payment;

  @OneToMany(type => IosCode, ioscode => ioscode.content)
  ioscode;

  @OneToMany(type => SubscriptionPlan, subscription => subscription.contents)
  subscription;
}
