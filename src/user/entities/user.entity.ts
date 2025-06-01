import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";


@Entity('users')
export class User {

    @ApiProperty({
        example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        description: 'Student ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty({
        example: 'daniela@mail.com',
        description: `Student's email`,
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    email: string;

    @ApiProperty({
        example: 'securePassword123!',
        description: 'Password of the user',
    })
    @Column('text')
    password?: string;

    @ApiProperty({
        example: 'Daniela Londoño',
        description: `Student's name`,
    })
    @Column('text')
    @Column('text')
    fullName: string;

    @ApiProperty({
        example: true,
        description: 'Indicates whether the user is active',
    })
    @Column('bool', { default: true })
    isActive: boolean;

    @ApiProperty({
        example: ['customer'],
        description: 'Roles assigned to the user',
        isArray: true
    })
    @Column('text',{
        array: true,
        default: ['customer']
    })
    roles: string[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
      this.email = this.email.toLowerCase().trim();
    }
  
    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
      this.checkFieldsBeforeInsert();
    }


}