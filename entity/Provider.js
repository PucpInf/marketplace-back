import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";
import {User} from "./User";
import {Content} from "./Content";
import {Payment} from "./Payment";

@Entity()
export class Provider {

  @PrimaryGeneratedColumn()
  id = Number();

  @Column ("varchar") companyName;

  @Column ("varchar") emailAccount;

  @Column ("varchar") stripeAccountId;

  @OneToOne(type => User)
  @JoinColumn()
  user;

  @OneToMany(type => Payment, payment => payment.provider)
  payment;

  @OneToMany(type => Content, content => content.owner)
  contents ;

}
