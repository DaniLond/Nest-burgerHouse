import { ApiProperty, PartialType } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsBoolean, IsIn, IsOptional } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @ApiProperty({
        description: 'User active status',
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'User roles',
        required: false,
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsIn(['admin', 'customer', 'delivery'], { each: true })
    roles?: string[];

}