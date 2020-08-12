import {Entity, PrimaryColumn,CreateDateColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import {Content} from "./Content";
import {Client} from "./Client";
import {Provider} from "./Provider";

@Entity()
export class Payment {

  @PrimaryColumn("varchar") orderId ;

  @Column ("double") amount;

  @Column ("varchar") currency;

  @CreateDateColumn () create_time;

  @Column("integer",{ nullable: true })
  providerId;

  @ManyToOne(type => Content, content => content.payments)
  content;

  @ManyToOne(type => Client, client => client.payments)
  client;

  @ManyToOne(type => Provider, provider => provider.payments)
  provider;
}
