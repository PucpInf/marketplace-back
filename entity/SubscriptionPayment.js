import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  CreateDateColumn, PrimaryColumn
} from "typeorm";
import {Content} from "./Content";
import {Client} from "./Client";
import {Provider} from "./Provider";
import {SubscriptionAgreement} from "./SubscriptionAgreement";

@Entity()
export class SubscriptionPayment {

  @PrimaryColumn("varchar") invoiceId ;

  @Column ("double") amount;

  @Column ("varchar") currency;

  @CreateDateColumn () create_time;

  @ManyToOne(type => Client, client => client.invoice)
  client;

  @ManyToOne(type => SubscriptionAgreement, subscription => subscription.payment)
  agreement;
}
