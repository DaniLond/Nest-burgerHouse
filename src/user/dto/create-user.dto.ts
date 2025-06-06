import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    
    @ApiProperty({
        description: 'A valid email (unique)',
        nullable: false,
        required: true,
    })
    @IsString()
    @IsEmail()
    email:string;

    @ApiProperty({
        description: 'The password must have a Uppercase, lowercase letter and a number',
        nullable: false,
        required: true,
    })
    @IsString()
    @MaxLength(50)
    @MinLength(6)
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
          'The password must have a Uppercase, lowercase letter and a number',
      })
    password: string;

    @ApiProperty()
    @IsString()
    fullName: string;
}